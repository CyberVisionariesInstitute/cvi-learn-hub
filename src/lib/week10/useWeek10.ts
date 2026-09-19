import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/hooks/useSession";
import {
  clear,
  createInitialState,
  load,
  reconcile,
  save,
  validate,
  type Identity,
  type StudyMode,
  type Week10State,
} from "./state";

export type SaveStatus = "idle" | "saving" | "saved";

export interface Week10Store {
  ready: boolean;
  identity: Identity;
  state: Week10State;
  status: SaveStatus;
  update: (fn: (prev: Week10State) => Week10State) => void;
  setMode: (mode: StudyMode) => void;
  toggleFinding: (evidenceId: string) => void;
  visitRoom: (roomId: string) => void;
  resetWeek: () => void;
  restore: (input: unknown) => { ok: true } | { ok: false; problems: string[] };
  backupJson: () => string;
}

/**
 * Week 10 learner store.
 *
 * `demo` scopes storage to an instructor demonstration slot so an instructor
 * exploring the lab can never overwrite or be mistaken for student work.
 */
export function useWeek10(demo = false): Week10Store {
  const { user, loading } = useSession();
  const [state, setState] = useState<Week10State>(() => createInitialState());
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const identity: Identity = demo
    ? { kind: "instructor-demo", id: user?.id ?? "local" }
    : { kind: "student", id: user?.id ?? "local" };
  const key = `${identity.kind}:${identity.id}`;

  useEffect(() => {
    if (loading) return;
    setState(load(identity) ?? createInitialState());
    setReady(true);
    // identity is derived from key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, key]);

  useEffect(() => {
    if (!ready) return;
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save(identity, state);
      setStatus("saved");
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, ready, key]);

  const update = useCallback((fn: (prev: Week10State) => Week10State) => {
    setState((prev) => reconcile(fn(prev)));
  }, []);

  const setMode = useCallback(
    (mode: StudyMode) => update((prev) => ({ ...prev, mode })),
    [update],
  );

  const toggleFinding = useCallback(
    (evidenceId: string) =>
      update((prev) => ({
        ...prev,
        findings: prev.findings.includes(evidenceId)
          ? prev.findings.filter((f) => f !== evidenceId)
          : [...prev.findings, evidenceId],
      })),
    [update],
  );

  const visitRoom = useCallback(
    (roomId: string) =>
      update((prev) =>
        prev.visitedRooms.includes(roomId)
          ? prev
          : { ...prev, visitedRooms: [...prev.visitedRooms, roomId] },
      ),
    [update],
  );

  const resetWeek = useCallback(() => {
    clear(identity);
    setState(createInitialState(state.mode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, state.mode]);

  const restore = useCallback(
    (input: unknown) => {
      const result = validate(input);
      if (!result.ok) return { ok: false as const, problems: result.problems };
      setState(result.state);
      return { ok: true as const };
    },
    [],
  );

  const backupJson = useCallback(() => JSON.stringify(state, null, 2), [state]);

  return {
    ready,
    identity,
    state,
    status,
    update,
    setMode,
    toggleFinding,
    visitRoom,
    resetWeek,
    restore,
    backupJson,
  };
}

export function downloadText(filename: string, text: string, type = "text/markdown") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
