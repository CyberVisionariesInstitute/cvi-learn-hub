<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Week 11 simulator state is server-authoritative (`w11_*` tables); all writes go through `src/lib/week11/week11.functions.ts` using the atomic `w11_commit_command`/`w11_reset_attempt` DB functions — why: students must not forge directory state, evidence or readiness.
- Week 11 readiness predicates and the answer key live only in `*.server.ts` files — why: expected-state rules must never reach student bundles.
