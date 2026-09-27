/** Approved Week 11 Module 4 visuals (Ivy, Security & Identity Analyst) and teaching concepts rendered as real UI. */
import hero from "@/assets/week11/week11-hero.webp.asset.json";
import m01 from "@/assets/week11/week11-m01.webp.asset.json";
import m02 from "@/assets/week11/week11-m02.webp.asset.json";
import m03 from "@/assets/week11/week11-m03.webp.asset.json";
import m04 from "@/assets/week11/week11-m04.webp.asset.json";
import m05 from "@/assets/week11/week11-m05.webp.asset.json";
import m06 from "@/assets/week11/week11-m06.webp.asset.json";

const art: Record<string, { url: string; alt: string }> = {
  M01: { url: m01.url, alt: "Ivy traces one person to separate account records beside directory and group symbols." },
  M02: { url: m02.url, alt: "Ivy helps an employee whose valid badge does not grant access to a restricted resource." },
  M03: { url: m03.url, alt: "Ivy onboards an employee at a directory administration workstation." },
  M04: { url: m04.url, alt: "Ivy reviews three bounded job-role permission sets and an extra access connection." },
  M05: { url: m05.url, alt: "Ivy manages joiner, mover and leaver actions, with verification and record preservation cues." },
  M06: { url: m06.url, alt: "Ivy reviews sign-in and audit evidence at her desk during an identity investigation." },
};

export function Week11Hero() {
  return (
    <section aria-labelledby="w11-hero" className="relative overflow-hidden rounded-xl border border-border bg-card">
      <img src={hero.url} alt="" className="absolute inset-0 h-full w-full object-cover object-[70%_20%]" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
      <div className="relative flex min-h-[190px] max-w-lg items-center p-5 sm:min-h-[260px] sm:p-8">
        <p className="font-display text-xs tracking-[0.2em] text-primary uppercase">Meet Ivy · Security & Identity Analyst</p>
        <h2 id="w11-hero" className="mt-2 font-display text-xl sm:text-2xl">Welcome to the Identity Center</h2>
        <p className="mt-2 text-sm">Ivy guides you through six missions: who is who, how access is decided, and how to prove it with evidence. The console below is yours — Ivy only steps in at mission briefings and the investigation.</p>
      </div>
    </section>
  );
}

export function MissionArt({ mission }: { mission: string }) {
  const a = art[mission];
  if (!a) return null;
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-card">
      <img src={a.url} alt={a.alt} loading="lazy" className="aspect-[16/7] w-full object-cover object-right" />
      <figcaption className="px-3 py-2 text-xs text-muted-foreground">Ivy: {a.alt.replace(/^Ivy /, "")}</figcaption>
    </figure>
  );
}

type Concept = { id: string; title: string; lead: string; rows: [string, string][]; note: string };
const concepts: Record<string, Concept> = {
  A: { id: "A", title: "Person, identity, account", lead: "One person can have separate accounts in different systems.", rows: [["Person", "The human at the organization"], ["Identity", "Attributes that represent the person"], ["AD account", "A record in the on-prem directory"], ["Cloud account", "A separate cloud directory record"]], note: "Linked to the same person does not mean the accounts are the same object." },
  B: { id: "B", title: "OU ≠ Group ≠ Role ≠ Permission", lead: "Four different concepts. Four different purposes.", rows: [["OU", "Organizes directory objects — e.g. a department container"], ["Group", "Collects accounts — e.g. a project team"], ["Role", "Bundles job permissions — e.g. document reader"], ["Permission", "Allows a specific action — e.g. read a document"]], note: "An OU move alone does not grant resource access in this simulator." },
  C: { id: "C", title: "Authentication vs. authorization", lead: "A valid badge does not open every door.", rows: [["Authentication", "“Is this really you?” Check the presented identity and credentials."], ["Authorization", "“Are you allowed through this door?” Check permission for this resource and action."]], note: "Successful authentication does not guarantee authorization." },
  D: { id: "D", title: "Role-based access control", lead: "RBAC connects an account to job permissions through assignments.", rows: [["User", "Employee"], ["Group", "Review Team"], ["Role", "Document Reader"], ["Permission", "Read"], ["Resource", "Training Documents"]], note: "Membership or a role name alone is not a grant of access. Assignments matter." },
  E: { id: "E", title: "Attribute-based access control", lead: "ABAC evaluates attributes against a policy.", rows: [["Identity", "Who is requesting?"], ["Department", "Which business unit?"], ["Device trust", "Is this device trusted?"], ["Resource classification", "How sensitive is it?"], ["Access decision", "Evaluate policy → allow or deny"]], note: "Teaching policy simulation; this is not a Microsoft Conditional Access implementation." },
  F: { id: "F", title: "AD DS vs. Microsoft Entra ID", lead: "Related identity concepts, distinct directory surfaces.", rows: [["Active Directory Domain Services", "Domain · users and groups · OUs · on-premises resources"], ["Microsoft Entra ID", "Cloud identities · users and groups · applications · cloud access"]], note: "OUs belong on the AD side. The Week 11 simulator does not automatically sync accounts." },
  G: { id: "G", title: "Azure resource RBAC", lead: "A role assignment grants resource actions within a scope.", rows: [["Identity / Group", "Who receives access?"], ["Azure role", "Which actions?"], ["Scope", "Where does it apply? (management group, subscription, resource group, resource)"], ["Resource", "What is accessed?"]], note: "Azure resource roles govern resources. Entra directory roles govern directory administration." },
  H: { id: "H", title: "Joiner → Mover → Leaver", lead: "Keep access aligned with the person's current work.", rows: [["Joiner", "Grant required access. Verify the request and identity."], ["Mover", "Remove obsolete access. Add newly required access."], ["Leaver", "Disable / revoke access. Preserve required records."]], note: "Sensitive actions, including password resets, require identity verification. Check every account in the ticket — an AD change does not silently update a cloud account." },
  I: { id: "I", title: "Sign-in log vs. audit log", lead: "Correlate authentication activity with administrative changes.", rows: [["Sign-in log", "Who attempted to authenticate? When? From where / which device? What was the result?"], ["Audit log", "Who changed something? What changed? Which target? Approval / correlation evidence?"]], note: "Match identities, timestamps and correlation IDs. A failed sign-in is not proof of compromise." },
  J: { id: "J", title: "Evidence-based investigation", lead: "Separate what you observed from what you infer.", rows: [["Observation", "What happened?"], ["Hypothesis", "What might explain it?"], ["Evidence", "What supports or challenges it?"], ["Supported conclusion", "What can you justify?"], ["Uncertainty", "What remains unknown?"], ["Next action", "What should happen next?"]], note: "An unusual event is not automatically proof of compromise. Preserve alternative explanations." },
};
const byMission: Record<string, string[]> = { M01: ["A", "B", "F"], M02: ["C"], M03: ["B", "F"], M04: ["D", "E", "G"], M05: ["H"], M06: ["I", "J"] };

export function ConceptGuides({ mission }: { mission: string }) {
  const list = (byMission[mission] ?? []).map((k) => concepts[k]!);
  if (!list.length) return null;
  return (
    <section aria-label="Concept guides" className="space-y-2">
      {list.map((c) => (
        <details key={c.id} className="rounded-lg border border-border bg-card p-3">
          <summary className="cursor-pointer text-sm font-medium"><span className="mr-2 font-mono text-xs text-primary">{c.id}</span>{c.title}</summary>
          <p className="mt-2 text-sm text-muted-foreground">{c.lead}</p>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            {c.rows.map(([k, v]) => <div key={k} className="rounded-md border border-border/70 bg-background/40 p-2"><dt className="text-xs font-semibold text-primary">{k}</dt><dd className="text-sm">{v}</dd></div>)}
          </dl>
          <p className="mt-2 text-xs">{c.note}</p>
        </details>
      ))}
    </section>
  );
}
