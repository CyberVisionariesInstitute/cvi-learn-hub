import { useState } from "react";
import { devices, groups, resources, roles } from "@/lib/week11/seed";
import { reasonText, type AccessTest } from "@/lib/week11/engine";
import { expectedDenyNote } from "@/lib/week11/guidance";
import type { Week11Store } from "@/lib/week11/useWeek11";
import { Badge, btnPrimary, Card, Decision, KV, Select } from "./ui";

const gName = (k: string) => groups.find((g) => g.key === k)?.name ?? k;

export function TestTrace({ t }: { t: AccessTest }) {
  const r = resources.find((x) => x.key === t.resource);
  return (
    <div className="rounded-md border border-border bg-surface p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Decision d={t.decision} />
        <span className="font-mono text-xs">{t.id}</span>
        <span>{t.account} → {r?.name} / <span className="font-mono">{t.action}</span></span>
        {t.mode !== "current-access" ? <Badge tone="warn">{t.mode === "preview" ? "Preview — not access evidence" : "What-if branch — policy simulation"}</Badge> : null}
      </div>
      <p className="mt-2">{reasonText(t.reasons)}</p>
      {expectedDenyNote(t) ? <p className="mt-2 rounded-md border border-primary/40 bg-primary/10 p-2 text-xs"><strong>Expected learning result:</strong> {expectedDenyNote(t)} A denial here is not a mistake.</p> : null}
      <div className="mt-2">
        <KV rows={[
          ["Session", t.session ?? "none"],
          ["Device", t.device ?? "—"],
          ["Memberships", t.memberships.map(gName).join(", ") || "none"],
          ["Matching paths", t.paths.length ? (
            <ul className="space-y-0.5">{t.paths.map((p, i) => <li key={i}>{p.kind === "acl" ? `${gName(p.group)} → AD ACL → ${p.scope}` : `${gName(p.group)} → ${roles.find((x) => x.key === p.role)?.name} → ${p.scope} (${p.assignment})`}</li>)}</ul>
          ) : "none"],
          ...(t.attributes ? [["Attributes", Object.entries(t.attributes).map(([k, v]) => `${k}=${v}${t.overrides?.[k] ? " (what-if)" : ""}`).join(" · ")] as [string, string]] : []),
          ["State revision", String(t.revision)],
        ]} />
      </div>
    </div>
  );
}

export function SignInTester({ store, account }: { store: Week11Store; account: string }) {
  const v = store.view!;
  const a = v.state.accounts.find((x) => x.key === account);
  const person = a ? a.person : null;
  const own = devices.find((d) => d.person === person)?.key ?? "unknown-device";
  const [device, setDevice] = useState(own);
  const [cred, setCred] = useState<"current" | "stale" | "incorrect">("current");
  const [mfa, setMfa] = useState<"pass" | "fail" | "cancel">("pass");
  const challenge = v.state.challenges.filter((c) => c.account === account && !c.used).at(-1);
  return (
    <Card eyebrow="Sign-in tester" title={`Simulate sign-in as ${account}`}>
      <p className="mb-3 text-xs text-muted-foreground">No real password is entered. “Current” means the account's current simulated credential version. {a?.dir === "AD" ? "The AD tester does not emulate MFA, Kerberos or LDAP." : "Simulated MFA is a deliberate choice here — it does not train accepting unexpected real prompts."}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label="Device / context" value={device} onChange={setDevice} options={devices.map((d) => ({ value: d.key, label: `${d.key} (${d.trust}, ${d.ip})` }))} />
        <Select label="Credential condition" value={cred} onChange={(x) => setCred(x as typeof cred)} options={[{ value: "current", label: "current" }, { value: "stale", label: "stale (older version)" }, { value: "incorrect", label: "incorrect" }]} />
        {a?.dir === "CLOUD" ? <Select label="MFA response" value={mfa} onChange={(x) => setMfa(x as typeof mfa)} options={[{ value: "pass", label: "pass" }, { value: "fail", label: "fail" }, { value: "cancel", label: "cancel" }]} /> : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={btnPrimary} disabled={store.busy} onClick={() => store.run({ type: "signin", account, device, credential: cred, mfa })}>Sign in (simulated)</button>
        {challenge ? <button type="button" className={btnPrimary} disabled={store.busy} onClick={() => store.run({ type: "complete_credential_change", challenge: challenge.key })}>Complete simulated credential change</button> : null}
      </div>
    </Card>
  );
}

export function AccessTester({ store, account: initial }: { store: Week11Store; account?: string }) {
  const v = store.view!;
  const [account, setAccount] = useState(initial ?? v.state.accounts[0]!.key);
  const acct = v.state.accounts.find((a) => a.key === account);
  const eligible = resources.filter((r) => (acct?.dir === "AD") === (r.authority === "AD"));
  const [resource, setResource] = useState(eligible[0]?.key ?? "R-HAND");
  const res = resources.find((r) => r.key === resource) ?? eligible[0];
  const [action, setAction] = useState(res?.actions[0] ?? "read");
  const sessions = v.state.sessions.filter((s) => s.account === account && (s.status === "active" || account.endsWith("-finley")));
  const [session, setSession] = useState("");
  const sess = session || sessions.at(-1)?.key || "";
  const [mode, setMode] = useState<"current-access" | "preview" | "abac-what-if">("current-access");
  const [ov, setOv] = useState<Record<string, string>>({});
  const myTests = v.state.tests.filter((t) => t.account === account).slice(-4).reverse();
  const run = () => store.run({ type: "test_access", account, session: sess || null, resource: res!.key, action: res!.actions.includes(action) ? action : res!.actions[0]!, mode, overrides: mode === "abac-what-if" ? Object.fromEntries(Object.entries(ov).filter(([, x]) => x)) : undefined });
  return (
    <Card eyebrow="Test Access" title="Run a deterministic access check">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {initial ? null : <Select label="Fictional account" value={account} onChange={(x) => { setAccount(x); setSession(""); }} options={v.state.accounts.map((a) => ({ value: a.key, label: `${a.key} (${a.status})` }))} />}
        <Select label="Resource" value={res?.key ?? ""} onChange={(x) => { setResource(x); setAction(resources.find((r) => r.key === x)?.actions[0] ?? "read"); }} options={eligible.map((r) => ({ value: r.key, label: `${r.name} (${r.key})` }))} />
        <Select label="Action" value={action} onChange={setAction} options={(res?.actions ?? []).map((a) => ({ value: a, label: a }))} />
        <Select label="Session" value={sess} onChange={setSession} options={[{ value: "", label: sessions.length ? "choose" : "none — sign in first" }, ...sessions.map((s) => ({ value: s.key, label: `${s.key} (${s.device})` }))]} />
        <Select label="Mode" value={mode} onChange={(x) => setMode(x as typeof mode)} options={[{ value: "current-access", label: "Current access (evidence)" }, { value: "preview", label: "Policy preview (not evidence)" }, ...(res?.key === "R-ABAC" ? [{ value: "abac-what-if", label: "ABAC what-if branch" }] : [])]} />
      </div>
      {mode === "abac-what-if" ? (
        <div className="mt-3 rounded-md border border-amber/50 bg-amber/10 p-3">
          <p className="text-xs">Attribute policy simulation — fictional rules, not an installed enterprise ABAC or Conditional Access engine. Change one attribute at a time; the saved directory is not modified.</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <Select label="Department override" value={ov['department'] ?? ""} onChange={(x) => setOv({ ...ov, department: x })} options={[{ value: "", label: "(current)" }, { value: "DEP-RESP", label: "DEP-RESP" }, { value: "DEP-AUD", label: "DEP-AUD" }, { value: "DEP-SUP", label: "DEP-SUP" }, { value: "unknown", label: "unknown" }]} />
            <Select label="Device trust override" value={ov['deviceTrust'] ?? ""} onChange={(x) => setOv({ ...ov, deviceTrust: x })} options={[{ value: "", label: "(current)" }, { value: "managed", label: "managed" }, { value: "unmanaged", label: "unmanaged" }, { value: "unknown", label: "unknown" }]} />
            <Select label="Classification override" value={ov['classification'] ?? ""} onChange={(x) => setOv({ ...ov, classification: x })} options={[{ value: "", label: "(current)" }, { value: "Internal", label: "Internal" }, { value: "Confidential", label: "Confidential" }]} />
          </div>
          {Object.values(ov).filter(Boolean).length !== 1 ? <p className="mt-2 text-xs font-medium" role="status">Set exactly one override for this run to count as a what-if case ({Object.values(ov).filter(Boolean).length} set now).</p> : null}
        </div>
      ) : null}
      {sessions.length === 0 ? <p className="mt-3 text-xs text-muted-foreground">No active session — use the Sign-in tester above first. After a sign-in, pick older sessions from the Session list to retest them.</p> : null}
      <button type="button" className={`${btnPrimary} mt-3`} disabled={store.busy} onClick={run}>Run test</button>
      <div className="mt-3 space-y-2" aria-live="polite">
        {myTests.map((t) => <TestTrace key={t.id} t={t} />)}
      </div>
    </Card>
  );
}
