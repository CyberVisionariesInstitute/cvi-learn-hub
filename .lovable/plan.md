# Audit: three database helper function warnings (read-only review)

Nothing was changed during this review. Evidence comes from the database linter, `pg_proc` (definitions, owner, search_path, grants), `pg_policies`, and a search of the app code.

## Summary

All three warnings are the same linter rule (0029): a SECURITY DEFINER function in the `public` schema that signed-in users can call directly through the API. The three functions are:

| Function | Purpose | Callable by | Used by |
|---|---|---|---|
| `public.has_role(_user_id uuid, _role app_role)` | True if that user has that role | postgres, service_role, authenticated (not anon) | Week 11 staff-read access rules (5 tables) |
| `public.is_staff(_user_id uuid)` | True if that user is an instructor or admin | same | Access rules on 14 PKI/portal tables |
| `public.owns_assignment(_assignment_id uuid, _user_id uuid)` | True if that assignment belongs to that user | same | `projects` insert rule, `hidden_events` student read rule |

What the three have in common:
- **SECURITY DEFINER**, owner `postgres`, with `search_path=public` pinned. Because the path is pinned, they can't be hijacked through a changed search_path.
- **Read-only:** each is a single `SELECT EXISTS` returning true or false. None of them writes anything or returns any rows.
- **What they can read:** `has_role` and `is_staff` read `user_roles`; `owns_assignment` reads `assignments`. They read these ignoring RLS, but only ever return a yes/no answer.
- **Anonymous visitors can't call them.** Only signed-in users can.

## Risk per function

**The actual problem:** any signed-in student can call these functions directly with arbitrary IDs, not just their own.

- **`has_role` / `is_staff`: tells a student whether a given user is staff.** A student who already knows a user ID can ask "is this ID an instructor or admin?" Staff IDs can already show up to students, for example in the `assigned_by` field on their own assignment row. So the leak is small: it tells students which IDs are staff, which is mild help with targeting.
  - It does not grant access to anything.
  - It can't be used to become staff: `user_roles` has no insert, update or delete rules.
  - **Severity: Low.**
- **`owns_assignment`: tells a student whether an assignment belongs to a given user.** They'd need to pass an exact assignment ID and user ID. Assignment IDs are random UUIDs that students can't list for other people.
  - It reveals nothing beyond yes or no.
  - The `projects` insert rule separately requires `owner_id = auth.uid()`, so this can't be used to create a project on someone else's assignment.
  - **Severity: Low.**

**What these functions cannot do:**
- They can't bypass or weaken any boundary.
- Every access rule passes `auth.uid()`, the caller's own ID, so a student can't make a rule evaluate as someone else.
- Neither can the direct-call leak: it only answers yes/no about IDs the student already knows.

## Effect on the areas you asked about

- **Student attempt isolation (Week 11):** Not affected.
  - Students get their own `w11_*` rows only through owner-scoped rules.
  - Students can't write to these tables directly (inserts, updates and deletes are denied).
  - All writes go through the server functions calling `w11_commit_command` / `w11_reset_attempt`. Only service_role can execute those two, so they are not flagged.
- **Instructor visibility:** Week 11 staff reads depend on `has_role(auth.uid(), 'instructor'|'admin')`, and the PKI staff rules depend on `is_staff`. Both work correctly. The fix below keeps them working.
- **Archived attempts and reset:** Not affected. Reset uses `w11_reset_attempt` (service_role only).
- **Reports, evidence, exports, logs:** Only indirectly. Staff read access to `w11_evidence`, `w11_actions`, `w11_reset_log`, `w11_reviews` and PKI `audit_log`/`submissions` goes through these helpers. No leak path was found.
- **Sign-in and permissions:** These helpers *are* the permission checks inside the access rules. They are correct as written.
- **Week 11 app code:** Never calls these three directly. The code search found only `w11_commit_command` and `w11_reset_attempt` being called. Week 11 uses `has_role` only indirectly, through the 5 staff-read rules.

## Why "just revoke EXECUTE" is wrong here

Access rules run as the signed-in user, so that user needs permission to execute these functions. Revoking it from `authenticated` would break every staff and owner rule listed above.

## Recommended remediation (not applied)

Keep the grants and the call signatures, and make each function only answer about the caller. When a normal API request passes someone else's ID, the function returns false. Server-side calls, where `auth.uid()` is empty (service_role), are unaffected.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (auth.uid() IS NULL OR _user_id = auth.uid())
     AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (auth.uid() IS NULL OR _user_id = auth.uid())
     AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('instructor','admin'));
$$;

CREATE OR REPLACE FUNCTION public.owns_assignment(_assignment_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (auth.uid() IS NULL OR _user_id = auth.uid())
     AND EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = _assignment_id AND a.user_id = _user_id);
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role), public.is_staff(uuid),
  public.owns_assignment(uuid, uuid) FROM PUBLIC, anon;
```

- The linter will still flag these, because they remain SECURITY DEFINER and signed-in users can call them. After the fix, that warning can be acknowledged as intentional.
- **Stronger alternative:** move the helpers into a separate `private` schema that the API doesn't expose, and point all 25 access rules at it. That removes direct API calls entirely, but it's a larger change that touches every rule.
- **Checks after applying:**
  - A staff account still sees Week 11 and PKI staff data.
  - A student still sees only their own rows.
  - A student calling `has_role` directly with a staff ID now gets false.
  - The Week 11 and PKI tests still pass.

## Release decision

**Not a Week 11 release blocker; handle it as separate technical debt, severity Low.** No student data crosses between accounts, instructor visibility isn't weakened, and reset, archive, evidence and export are unaffected. The only exposure is a minor yes/no leak about IDs a student already knows.
