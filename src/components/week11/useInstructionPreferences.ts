import { useEffect, useState } from "react";
import { instructionSteps, parseInstructionPreferences, type InstructionPreferences } from "@/lib/week11/instructions";
import { missions, type MissionId } from "@/lib/week11/seed";

/** Local orientation only. Never writes learner text, simulator state or readiness. */
export function useInstructionPreferences(attemptId: string, mission: MissionId) {
  const key = `cvi:w11:instructions:v1:${attemptId}`;
  const [preferences, setPreferences] = useState<InstructionPreferences>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  useEffect(() => {
    try { setPreferences(parseInstructionPreferences(localStorage.getItem(key))); }
    catch { setPreferences({}); }
    setLoadedKey(key);
  }, [key]);
  useEffect(() => {
    if (loadedKey !== key) return;
    try { localStorage.setItem(key, JSON.stringify(preferences)); } catch { /* Guidance still works without storage. */ }
  }, [key, loadedKey, preferences]);
  const preference = loadedKey === key ? preferences[mission] : undefined;
  const onStep = (current: number) => setPreferences((all) => ({ ...all, [mission]: { completed: all[mission]?.completed ?? [], current } }));
  const onComplete = (id: string, checked: boolean) => setPreferences((all) => {
    const previous = all[mission] ?? { current: 0, completed: [] };
    return { ...all, [mission]: { ...previous, completed: checked ? [...new Set([...previous.completed, id])] : previous.completed.filter((value) => value !== id) } };
  });
  const nextIncomplete = missions.find((item) => instructionSteps[item.key].some((step) => !preferences[item.key]?.completed.includes(step.id)));
  return { preference, onStep, onComplete, nextIncomplete: nextIncomplete?.key };
}
