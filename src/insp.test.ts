import { it } from "vitest";
import { getScenarioPublic } from "@/lib/capstone/scenarios/registry.server";
import { executeWorkload } from "@/lib/capstone/simulation";
import { emptyPhase3State } from "@/lib/capstone/project-state";
it("dump", () => {
  const s = getScenarioPublic("cedar-valley-health","1.0.0")!;
  const st = emptyPhase3State();
  const inst = { id:"w1", definitionId:s.workloads[0]!.id, name:"x", bindings:{}, config:{} };
  const r = executeWorkload({state:st,scenario:s,instance:inst,definition:s.workloads[0]!,effects:[],activeEventKeys:[],clockDay:0,at:"2026-01-01T00:00:00.000Z",runId:"r"});
  console.log(r.result, r.checks.map(c=>`${c.order} ${c.key} ${c.result}`).join("\n"));
});
