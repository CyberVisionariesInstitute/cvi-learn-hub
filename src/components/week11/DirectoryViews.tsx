import { useState } from "react";
import { accountDn, effectiveAccess } from "@/lib/week11/engine";
import { adAcl, departments, devices, employmentLabel, groups, ous, resourceGroups, resources, roles, tickets, type Directory } from "@/lib/week11/seed";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { changeMissions, glossary, type Nav } from "@/lib/week11/guidance";
import { AccessTester, SignInTester } from "./Testers";
import { Badge, btn, btnPrimary, Card, input, KV, Select, TableWrap } from "./ui";

const ticketOptions = [{ value: "", label: "No ticket — write a reason" }, ...tickets.map((t) => ({ value: t.key, label: `${t.key} — ${t.title}` }))];

function Justify({ store, onChange }: { store: Week11Store; onChange: (j: { ticket?: string | undefined; reason?: string | undefined }) => void }) {
  const recov = store.view!.state.recoveryTickets.map((r) => ({ value: r.key, label: `${r.key} (training recovery)` }));
  const [t, setT] = useState("");
  const [r, setR] = useState("");
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Select label="Linked ticket" value={t} onChange={(x) => { setT(x); onChange({ ticket: x || undefined, reason: r }); }} options={[...ticketOptions, ...recov]} />
      <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">Reason / work note</span>
        <input className={input} value={r} maxLength={2000} onChange={(e) => { setR(e.target.value); onChange({ ticket: t || undefined, reason: e.target.value }); }} placeholder="e.g. sandbox experiment" /></label>
    </div>
  );
}

export function UsersView({ store, dir, selected, onSelect, mission, go }: { store: Week11Store; dir: Directory; selected: string | null; onSelect: (k: string | null) => void; mission?: string; go?: (n: Nav) => void }) {
  const s = store.view!.state;
  const [q, setQ] = useState("");
  const list = s.accounts.filter((a) => a.dir === dir && (a.upn + (s.people.find((p) => p.key === a.person)?.name ?? "")).toLowerCase().includes(q.toLowerCase()));
  const a = s.accounts.find((x) => x.key === selected && x.dir === dir) ?? null;
  const jamie = s.people.find((p) => p.key === "P08")!;
  const [newOu, setNewOu] = useState("OU-SUP");
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className={a ? "hidden lg:block" : ""}>
        <Card eyebrow={dir === "AD" ? "Viewing: On-Premises AD" : "Viewing: Cloud (Entra ID)"} title={dir === "AD" ? "AD users" : "Cloud users"}>
          <p className="mb-2 text-xs text-muted-foreground">Looking for a {dir === "AD" ? "cloud (cl-…)" : "AD (ad-…)"} account? Switch the directory above the menu.</p>
          <label className="block"><span className="sr-only">Search users</span><input className={input} placeholder="Search name or UPN" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <ul className="mt-3 space-y-1.5">
            {list.map((x) => (
              <li key={x.key}><button type="button" onClick={() => onSelect(x.key)} aria-pressed={x.key === selected} className={`${btn} w-full text-left ${x.key === selected ? "border-primary bg-primary/10" : ""}`}>
                <span className="block">{s.people.find((p) => p.key === x.person)?.name}</span>
                <span className="block break-all font-mono text-xs text-muted-foreground">{x.upn}</span>
                <span className="mt-1 flex gap-1"><Badge tone={x.status === "enabled" ? "allow" : "deny"}>{x.status}</Badge>{x.locked ? <Badge tone="warn">locked</Badge> : null}</span>
              </button></li>
            ))}
          </ul>
          {!(dir === "AD" ? jamie.ad : jamie.cloud) ? (
            <div className="mt-4 rounded-md border border-border p-3 text-sm">
              <p className="font-medium">Planned account: Jamie Ellis (P08)</p>
              <p className="text-xs text-muted-foreground">Created only from its approving ticket ({dir === "AD" ? "T301" : "T501"}). Starts disabled, no groups, must change credential.</p>
              {dir === "AD" ? <div className="mt-2"><Select label="OU" value={newOu} onChange={setNewOu} options={ous.map((o) => ({ value: o.key, label: `${o.name} (${o.key})` }))} /></div> : null}
              <button type="button" className={`${btnPrimary} mt-2`} disabled={store.busy} onClick={() => store.run({ type: "create_account", person: "P08", dir, ou: dir === "AD" ? newOu : undefined, ticket: dir === "AD" ? "T301" : "T501" })}>Create planned account</button>
            </div>
          ) : null}
        </Card>
      </div>
      {a ? <AccountDetail store={store} accountKey={a.key} onBack={() => onSelect(null)} mission={mission} go={go} /> : <Card><p className="text-sm text-muted-foreground">Select an account to see its person record, groups and effective access, administrative actions, and the Sign-in and Test Access testers.</p></Card>}
    </div>
  );
}

function AccountDetail({ store, accountKey, onBack, mission, go }: { store: Week11Store; accountKey: string; onBack: () => void; mission?: string | undefined; go?: ((n: Nav) => void) | undefined }) {
  const s = store.view!.state;
  const a = s.accounts.find((x) => x.key === accountKey)!;
  const p = s.people.find((x) => x.key === a.person)!;
  const mem = s.memberships.filter((m) => m.account === a.key);
  const eff = effectiveAccess(s, a.key);
  const sessions = s.sessions.filter((x) => x.account === a.key);
  const [j, setJ] = useState<{ ticket?: string | undefined; reason?: string | undefined }>({});
  const [grp, setGrp] = useState(groups.find((g) => g.dir === a.dir)!.key);
  const [ou, setOu] = useState(a.ou ?? "OU-STAFF");
  const [dept, setDept] = useState(a.dept);
  const [tkt, setTkt] = useState("");
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${btn} lg:hidden`} onClick={onBack}>← Back to users</button>
        <a href={`#si-${a.key}`} className={`${btn} text-xs`}>Jump to Sign-in tester</a>
        <a href={`#at-${a.key}`} className={`${btn} text-xs`}>Jump to Test Access</a>
      </div>
      <Card eyebrow={a.dir === "AD" ? "On-Premises Directory — Active Directory (simulated AD DS)" : "Cloud Identity — Microsoft Entra ID (simulation)"} title={`${p.name} · ${a.key}`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium">Account (identity attributes)</h3>
            <KV rows={[
              ["Account ID", a.key], [<abbr key="u" title={glossary["UPN"]}>UPN</abbr>, a.upn], ...(a.dir === "AD" ? [["sAMAccountName", a.username] as [React.ReactNode, React.ReactNode], ["OU", a.ou ?? "—"] as [React.ReactNode, React.ReactNode], [<abbr key="d" title={glossary["DN"]}>DN</abbr>, accountDn(s, a) ?? "—"] as [React.ReactNode, React.ReactNode]] : [["OU", "none — OUs are an AD concept in this exercise"] as [React.ReactNode, React.ReactNode]]),
              ["Department attr", `${a.dept} (${departments[a.dept]})`], ["Status", a.status], ["Locked", a.locked ? "yes" : "no"],
              [<abbr key="c" title={glossary["Credential version"]}>Credential version</abbr>, String(a.credentialVersion)], ["Must change", a.mustChange ? "yes" : "no"], ["Failed count", String(a.failedCount)],
              ["MFA", a.mfa], [<abbr key="r" title={glossary["Security revision"]}>Security revision</abbr>, String(a.securityRevision)],
            ]} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Person record (HR)</h3>
            <KV rows={[["Person", `${p.key} ${p.name}`], ["HR ID", p.hrId], ["Department", departments[p.dept]], ["Employment", employmentLabel[p.status]], ["AD account", p.ad ? (go ? <button type="button" className="underline" onClick={() => go({ label: p.ad!, view: "users", account: p.ad! })}>{p.ad} (open)</button> : p.ad) : "none"], ["Cloud account", p.cloud ? (go ? <button type="button" className="underline" onClick={() => go({ label: p.cloud!, view: "users", account: p.cloud! })}>{p.cloud} (open)</button> : p.cloud) : "none"]]} />
            <p className="mt-2 text-xs text-muted-foreground">No automatic synchronization: the two accounts have separate status, credentials, memberships and sessions.</p>
          </div>
        </div>
      </Card>
      <Card title="Groups and effective access">
        <p className="text-sm">Member of: {mem.length ? mem.map((m) => <Badge key={m.group}>{groups.find((g) => g.key === m.group)?.name} ({m.group})</Badge>) : "no groups"}</p>
        <div className="mt-3"><TableWrap label="Effective access">
          <thead><tr className="border-b border-border"><th className="p-2">Resource</th><th className="p-2">Action</th><th className="p-2">All granting paths</th></tr></thead>
          <tbody>{eff.length ? eff.map((e) => <tr key={e.resource + e.action} className="border-b border-border/50"><td className="p-2">{resources.find((r) => r.key === e.resource)?.name}</td><td className="p-2 font-mono">{e.action}</td><td className="p-2 text-xs">{e.paths.map((x, i) => <div key={i}>{x.kind === "acl" ? `${x.group} → AD ACL` : `${x.group} → ${x.role} @ ${x.scope}`}</div>)}</td></tr>) : <tr><td className="p-2" colSpan={3}>No grants.</td></tr>}</tbody>
        </TableWrap></div>
        <p className="mt-2 text-xs text-muted-foreground">Calculated from current memberships and assignments (not a sign-in). ABAC conditions for the Internal Response Note are checked only during a test.</p>
      </Card>
      <Card title="Administrative actions" eyebrow="Changes are recorded in Audit Logs">
        {mission && changeMissions[a.key] && !changeMissions[a.key]!.includes(mission) ? <p className="mb-3 rounded-md border border-amber/60 bg-amber/10 p-2 text-sm" role="note">Heads-up: changes to {a.key} belong to {changeMissions[a.key]!.join("/")}. Looking is fine; changing it now alters that mission's starting point.</p> : null}
        <p className="mb-2 text-xs text-muted-foreground">Choose a linked ticket or write a reason first — actions without one are refused.</p>
        <Justify store={store} onChange={setJ} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <h3 className="text-sm font-medium md:col-span-2">Membership</h3>
          <div className="flex items-end gap-2"><div className="flex-1"><Select label="Group (same directory)" value={grp} onChange={setGrp} options={groups.filter((g) => g.dir === a.dir).map((g) => ({ value: g.key, label: `${g.name} (${g.key})` }))} /></div></div>
          <div className="flex flex-wrap items-end gap-2">
            <button type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "add_member", group: grp, account: a.key, ...j })}>Add to group</button>
            <button type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "remove_member", group: grp, account: a.key, ...j })}>Remove from group</button>
          </div>
          {a.dir === "AD" ? <>
            <h3 className="text-sm font-medium md:col-span-2">Placement (organization only)</h3>
            <Select label="Move to OU" value={ou} onChange={setOu} options={ous.map((o) => ({ value: o.key, label: `${o.name} (${o.key})` }))} />
            <div className="flex items-end"><button type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "move_ou", account: a.key, ou, ...j })}>Move OU (organization only)</button></div>
          </> : null}
          <h3 className="text-sm font-medium md:col-span-2">Status and sessions</h3>
          <div className="flex flex-wrap items-end gap-2 md:col-span-2">
            <button type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "set_status", account: a.key, status: "enabled", ...j })}>Enable</button>
            <button type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "set_status", account: a.key, status: "disabled", ...j })}>Disable</button>
            <button type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "revoke_sessions", account: a.key, ...j })}>Revoke sessions</button>
          </div>
          <h3 className="text-sm font-medium md:col-span-2">Credentials (need a verified sensitive-action ticket)</h3>
          <div className="flex flex-wrap items-end gap-2 md:col-span-2">
            <Select label="Sensitive-action ticket" value={tkt} onChange={setTkt} options={[{ value: "", label: "choose" }, ...tickets.filter((t) => t.permitsReset || t.permitsMfa).map((t) => ({ value: t.key, label: t.key })), ...s.recoveryTickets.filter((r) => r.account === a.key).map((r) => ({ value: r.key, label: r.key }))]} />
            <button type="button" className={btn} disabled={store.busy || !tkt} onClick={() => store.run({ type: "reset_credential", account: a.key, ticket: tkt })}>Reset credential</button>
            <button type="button" className={btn} disabled={store.busy || !tkt} onClick={() => store.run({ type: "unlock", account: a.key, ticket: tkt })}>Unlock</button>
            {a.dir === "CLOUD" && a.mfa !== "enrolled" ? <button type="button" className={btn} disabled={store.busy || !tkt} onClick={() => store.run({ type: "enroll_mfa", account: a.key, ticket: tkt })}>Complete simulated MFA enrollment</button> : null}
          </div>
          <h3 className="text-sm font-medium md:col-span-2">Department transfer</h3>
          <div className="flex flex-wrap items-end gap-2 md:col-span-2">
            <Select label="Department transfer (person + both accounts)" value={dept} onChange={(x) => setDept(x as typeof dept)} options={Object.entries(departments).map(([k, n]) => ({ value: k, label: `${n} (${k})` }))} />
            <button type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "transfer_department", person: p.key, dept, ticket: j.ticket ?? "" })}>Apply transfer</button>
          </div>
          {a.locked ? <div className="flex items-end"><button type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "open_recovery", account: a.key })}>Open training recovery ticket</button></div> : null}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Sessions: {sessions.length ? sessions.map((x) => `${x.key} (${x.status})`).join(", ") : "none"}</p>
      </Card>
      <div id={`si-${a.key}`} className="scroll-mt-24"><SignInTester key={`si-${a.key}`} store={store} account={a.key} /></div>
      <div id={`at-${a.key}`} className="scroll-mt-24"><AccessTester key={`at-${a.key}`} store={store} account={a.key} /></div>
    </div>
  );
}

export function GroupsView({ store, dir }: { store: Week11Store; dir?: Directory }) {
  const s = store.view!.state;
  const [note, setNote] = useState("");
  const [both, setBoth] = useState(false);
  const shown = groups.filter((g) => both || !dir || g.dir === dir);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-wrap items-center gap-2 text-sm md:col-span-2"><Badge tone="info">{both || !dir ? "Showing both directories" : dir === "AD" ? "Showing On-Premises AD groups" : "Showing Cloud groups"}</Badge>
        {dir ? <button type="button" className={btn} aria-pressed={both} onClick={() => setBoth(!both)}>{both ? "Show only the current directory" : "Show both directories"}</button> : null}</div>
      {shown.map((g) => {
        const members = s.memberships.filter((m) => m.group === g.key).map((m) => m.account);
        const asg = s.assignments.filter((a) => a.group === g.key);
        const acl = adAcl.filter((a) => a.group === g.key);
        return (
          <Card key={g.key} eyebrow={`${g.dir === "AD" ? "AD" : "Cloud"} security group · ${g.key}`} title={g.name}>
            <p className="text-sm text-muted-foreground">{g.purpose}</p>
            <p className="mt-2 text-sm">Members: {members.length ? members.join(", ") : "none"}</p>
            <p className="mt-1 text-sm">Grants: {g.dir === "AD" ? (acl.length ? acl.map((a) => `${a.resource}/${a.actions.join(",")}`).join("; ") : "no resource ACL entry") : (asg.length ? asg.map((a) => `${a.key}: ${a.role} @ ${a.scope}`).join("; ") : "no role assignment")}</p>
            {g.dir === "CLOUD" ? (
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <input aria-label={`Review note for ${g.name}`} className={`${input} flex-1`} placeholder="Review note / rationale" value={note} onChange={(e) => setNote(e.target.value)} />
                <button type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "review_config", group: g.key, note })}>Mark reviewed</button>
              </div>
            ) : null}
          </Card>
        );
      })}
      <p className="text-xs text-muted-foreground md:col-span-2">Groups are flat in v1 (no nesting). A group name has no permissions by itself — only its ACL entries or role assignments do. Add or remove members from a user's detail page.</p>
    </div>
  );
}

export function OUsView({ store, dir }: { store: Week11Store; dir: Directory }) {
  const s = store.view!.state;
  if (dir === "CLOUD") return <Card title="Organizational Units"><p className="text-sm">OUs are an AD concept in this exercise. Switch to the On-Premises Directory tab to see the OU tree.</p></Card>;
  const render = (parent: string | null, depth: number): React.ReactNode => ous.filter((o) => o.parent === parent).map((o) => (
    <li key={o.key} style={{ marginLeft: depth * 16 }} className="mt-2">
      <p className="font-medium">{o.name} <span className="font-mono text-xs text-muted-foreground">{o.key}</span></p>
      <p className="break-all font-mono text-xs text-muted-foreground">{o.dn}</p>
      <p className="text-sm">Accounts: {s.accounts.filter((a) => a.ou === o.key).map((a) => a.key).join(", ") || "none"}</p>
      <ul>{render(o.key, depth + 1)}</ul>
    </li>
  ));
  return (
    <Card title="AD organizational units" eyebrow="ad.cloudheights.example (fictional)">
      <p className="text-sm text-muted-foreground">OU placement is organization only. No Group Policy and no OU-based resource permissions are simulated. Moving to Disabled Accounts does not disable an account.</p>
      <ul>{render(null, 0)}</ul>
    </Card>
  );
}

export function RolesView({ store }: { store: Week11Store }) {
  const s = store.view!.state;
  const [tab, setTab] = useState<"cloud" | "acl" | "azure">("cloud");
  const [g, setG] = useState("GC-JUN");
  const [r, setR] = useState("RL-LAND");
  const [scope, setScope] = useState("R-LAND");
  const [reason, setReason] = useState("");
  const [ticket, setTicket] = useState("");
  const isAz = tab === "azure";
  const scopes = isAz ? [...resourceGroups.map((x) => ({ value: x.key, label: `${x.name} (${x.key})` })), ...resources.filter((x) => x.authority === "AZURE").map((x) => ({ value: x.key, label: x.name }))] : resources.filter((x) => x.authority === "CLOUD_APP" || x.authority === "CLOUD_DIR").map((x) => ({ value: x.key, label: `${x.name} (${x.key})` }));
  const shownRoles = roles.filter((x) => (x.authority === "AZURE") === isAz);
  const rows = s.assignments.filter((a) => (roles.find((x) => x.key === a.role)?.authority === "AZURE") === isAz);
  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Roles and access" className="flex flex-wrap gap-2">
        {([["cloud", "Cloud App Roles"], ["acl", "AD ACL"], ["azure", "Azure Resource Access"]] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} type="button" className={`${btn} ${tab === k ? "border-primary bg-primary/10" : ""}`} onClick={() => { setTab(k); if (k === "azure") { setR("RL-AZREAD"); setScope("RG-LAB"); setG("GC-AZ"); } else { setR("RL-LAND"); setScope("R-LAND"); } }}>{l}</button>)}
      </div>
      {tab === "acl" ? (
        <Card title="AD resource ACL (read-only in v1)">
          <TableWrap label="AD ACL"><thead><tr className="border-b border-border"><th className="p-2">Group</th><th className="p-2">Resource</th><th className="p-2">Actions</th></tr></thead>
            <tbody>{adAcl.map((a) => <tr key={a.group + a.resource} className="border-b border-border/50"><td className="p-2">{a.group}</td><td className="p-2">{resources.find((x) => x.key === a.resource)?.name}</td><td className="p-2 font-mono">{a.actions.join(", ")}</td></tr>)}</tbody></TableWrap>
          <p className="mt-2 text-xs text-muted-foreground">Group membership is editable; ACL entries are fixed. OU hierarchy does not participate.</p>
        </Card>
      ) : (
        <>
          <Card title={isAz ? "Azure teaching role catalog" : "Cloud role catalog"} eyebrow={isAz ? "Separate from Entra directory roles" : "Fictional Cloud Heights app roles — not Microsoft built-in roles"}>
            <ul className="space-y-1 text-sm">{shownRoles.map((x) => <li key={x.key}><span className="font-mono text-xs">{x.key}</span> {x.name} — {x.perms.map((p) => `${p.type}: ${p.actions.join(",")}`).join(" · ")}</li>)}</ul>
            <p className="mt-2 text-xs text-muted-foreground">Definitions are read-only. A role grants nobody access until assigned to a group at a scope.</p>
          </Card>
          <Card title="Group → role → scope assignments">
            <TableWrap label="Assignments"><thead><tr className="border-b border-border"><th className="p-2">ID</th><th className="p-2">Group</th><th className="p-2">Role</th><th className="p-2">Scope</th><th className="p-2"><span className="sr-only">Action</span></th></tr></thead>
              <tbody>{rows.map((a) => <tr key={a.key} className="border-b border-border/50"><td className="p-2 font-mono">{a.key}</td><td className="p-2">{a.group}</td><td className="p-2">{a.role}</td><td className="p-2">{a.scope}</td><td className="p-2"><button type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "revoke_role", assignment: a.key, ticket: ticket || undefined, reason })}>Remove</button></td></tr>)}</tbody></TableWrap>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Select label="Cloud group" value={g} onChange={setG} options={groups.filter((x) => x.dir === "CLOUD").map((x) => ({ value: x.key, label: `${x.name} (${x.key})` }))} />
              <Select label="Role" value={r} onChange={setR} options={shownRoles.map((x) => ({ value: x.key, label: x.name }))} />
              <Select label="Scope" value={scope} onChange={setScope} options={scopes} />
              <Select label="Ticket" value={ticket} onChange={setTicket} options={ticketOptions} />
              <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">Reason</span><input className={input} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
              <div className="flex items-end"><button type="button" className={btnPrimary} disabled={store.busy} onClick={() => store.run({ type: "assign_role", group: g, role: r, scope, ticket: ticket || undefined, reason })}>Add assignment</button></div>
            </div>
          </Card>
        </>
      )}
      <AccessTester store={store} />
    </div>
  );
}

export function ResourcesView() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {resources.map((r) => (
        <Card key={r.key} eyebrow={`${r.key} · ${r.authority}`} title={r.name}>
          <KV rows={[["Type", r.type], ["Classification", r.classification], ["Owner", departments[r.owner]], ["Actions", r.actions.join(", ")], ...(r.parent ? [["Scope parent", r.parent] as [string, string]] : [])]} />
          <p className="mt-2 text-xs text-muted-foreground">Content is shown only after an allowed simulated test. All content is synthetic.</p>
        </Card>
      ))}
      <p className="text-xs text-muted-foreground md:col-span-2">Devices: {devices.map((d) => `${d.key} (${d.trust})`).join(", ")}. Device trust is a seeded simulation attribute, not your real device.</p>
    </div>
  );
}

export function TicketsView({ store, initial }: { store: Week11Store; initial?: string | undefined }) {
  const s = store.view!.state;
  const [open, setOpen] = useState(initial && tickets.some((x) => x.key === initial) ? initial : tickets[0]!.key);
  const t = tickets.find((x) => x.key === open)!;
  const ts = s.tickets.find((x) => x.key === open)!;
  const [route, setRoute] = useState<"trusted" | "request_only">("trusted");
  const [hr, setHr] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <Card title="IAM ticket queue">
        <ul className="space-y-1.5">{s.tickets.map((x) => { const seed = tickets.find((y) => y.key === x.key)!; return (
          <li key={x.key}><button type="button" aria-pressed={x.key === open} onClick={() => setOpen(x.key)} className={`${btn} w-full text-left ${x.key === open ? "border-primary bg-primary/10" : ""}`}>
            <span className="font-mono text-xs">{x.key} · {seed.mission}</span><span className="block text-sm">{seed.title}</span><span className="mt-1 flex gap-1"><Badge>{x.status}</Badge>{seed.verification ? <Badge tone={x.verification === "passed" ? "allow" : x.verification === "failed" ? "deny" : "neutral"}>verify: {x.verification}</Badge> : null}</span>
          </button></li>); })}
          {s.recoveryTickets.map((r) => <li key={r.key} className="text-xs text-muted-foreground">{r.key} — training recovery for {r.account} (verify & act from the ticket's account page)</li>)}
        </ul>
      </Card>
      <div className="space-y-4">
        <Card eyebrow={`${t.key} · ${t.mission}`} title={t.title}>
          <KV rows={[["Requester", t.requester], ["Approver", t.approver], ["Targets", t.targets.join(", ")], ["Status", ts.status]]} />
          <p className="mt-3 text-sm">{t.request}</p>
          <p className="mt-2 rounded-md border border-border bg-surface p-3 text-sm"><strong>Approved scope:</strong> {t.approvedScope}</p>
          <h3 className="mt-3 text-sm font-medium">Attached documents (fictional)</h3>
          <ul className="mt-1 space-y-2">{t.documents.map((d) => <li key={d.id} className="rounded-md border border-border p-2 text-sm"><span className="font-mono text-xs">{d.id}</span> <strong>{d.title}</strong><p>{d.body}</p></li>)}</ul>
          <p className="mt-2 text-xs text-muted-foreground">An approval authorizes a business action — it does not configure anything. Resolving a ticket never grants access by itself.</p>
        </Card>
        {t.verification ? (
          <Card title="Identity verification" eyebrow="The system decides pass/fail from the evidence route">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Evidence route" value={route} onChange={(x) => setRoute(x as typeof route)} options={[{ value: "trusted", label: "Directory-confirmed callback + HR ID" }, { value: "request_only", label: "Requester-supplied details only" }]} />
              <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">HR ID to compare</span><input className={input} value={hr} onChange={(e) => setHr(e.target.value)} placeholder="CH-000" /></label>
            </div>
            <button type="button" className={`${btnPrimary} mt-3`} disabled={store.busy} onClick={() => store.run({ type: "verify", ticket: t.key, route, hrId: hr })}>Run verification</button>
          </Card>
        ) : null}
        <Card title="Work notes and status">
          <ul className="mb-2 space-y-1 text-sm">{ts.notes.map((n) => <li key={n.seq}>#{n.seq}: {n.text}</li>)}</ul>
          <textarea className={input} rows={3} value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} aria-label="Decision note" placeholder="Decision note: what you did, what you checked, and why" />
          <div className="mt-2 flex flex-wrap gap-2">
            {(["investigating", "in_progress", "resolved", "escalated"] as const).map((st) => <button key={st} type="button" className={btn} disabled={store.busy} onClick={() => store.run({ type: "ticket_status", ticket: t.key, status: st, note })}>Set {st.replace("_", " ")}</button>)}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Linked simulator actions: {ts.linkedSeq.length ? ts.linkedSeq.map((x) => `#${x}`).join(", ") : "none yet"}</p>
        </Card>
      </div>
    </div>
  );
}
