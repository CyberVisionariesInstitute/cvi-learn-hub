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

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface Week10Store {
  ready: boolean;
  identity: Identity;
  state: Week10State;
  status: SaveStatus;
  /** Human-readable reason the last save failed, if it did. */
  saveError: string | null;
  update: (fn: (prev: Week10State) => Week10State) => void;
  setMode: (mode: StudyMode) => void;
  toggleFinding: (evidenceId: string) => void;
  visitRoom: (roomId: string) => void;
  resetWeek: () => void;
  restore: (input: unknown) => { ok: true } | { ok: false; problems: string[] };
  backupJson: () => string;
  /** Writes any pending edit immediately (navigation, refresh, download). */
  flush: () => void;
}

const SAVE_DELAY = 400;

const STORAGE_FAILED =
  "Your latest work could not be saved in this browser. This usually means private browsing or full storage. Download the JSON backup below now so you do not lose it, then free up space or use a normal browser window.";

/**
 * Week 10 learner store.
 *
 * `demo` scopes storage to an instructor demonstration slot so an instructor
 * exploring the lab can never overwrite or be mistaken for student work.
 *
 * Saving is debounced for typing comfort, but any pending write is flushed
 * before the identity changes, before the page is hidden or unloaded, and on
 * unmount — so navigating straight after typing never loses the newest edit.
 * Freshly loaded state is never written back, so a restored save can't be
 * overwritten by defaults.
 */
export function useWeek10(demo = false): Week10Store {
  const { user, loading } = useSession();
  const [state, setState] = useState<Week10State>(() => createInitialState());
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  const dirty = useRef(false);

  const identity: Identity = demo
    ? { kind: "instructor-demo", id: user?.id ?? "local" }
    : { kind: "student", id: user?.id ?? "local" };
  const key = `${identity.kind}:${identity.id}`;
  /** Identity that owns the state currently in memory. */
  const identityRef = useRef(identity);

  stateRef.current = state;

  const writeNow = useCallback((target: Identity, value: Week10State) => {
    try {
      save(target, value);
      dirty.current = false;
      setSaveError(null);
      setStatus("saved");
    } catch {
      setSaveError(STORAGE_FAILED);
      setStatus("error");
    }
  }, []);

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (!dirty.current) return;
    writeNow(identityRef.current, stateRef.current);
  }, [writeNow]);

  /* Hydrate. Any pending write still belongs to the previous identity. */
  useEffect(() => {
    if (loading) return;
    flush();
    const loaded = load(identity) ?? createInitialState();
    identityRef.current = identity;
    stateRef.current = loaded;
    dirty.current = false;
    setState(loaded);
    setStatus("idle");
    setSaveError(null);
    setReady(true);
    // identity is derived from key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, key]);

  /* Debounced write of learner edits only. */
  useEffect(() => {
    if (!ready || !dirty.current) return;
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      writeNow(identityRef.current, stateRef.current);
    }, SAVE_DELAY);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, ready, key]);

  /* Flush on refresh, tab hide, and unmount (route change). */
  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onHide);
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [flush]);

  const update = useCallback((fn: (prev: Week10State) => Week10State) => {
    dirty.current = true;
    setState((prev) => {
      const next = reconcile(fn(prev));
      stateRef.current = next;
      return next;
    });
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
    (roomId: string) => {
      // Idempotent: a room already opened must not re-render or re-save.
      if (stateRef.current.visitedRooms.includes(roomId)) return;
      update((prev) =>
        prev.visitedRooms.includes(roomId)
          ? prev
          : { ...prev, visitedRooms: [...prev.visitedRooms, roomId] },
      );
    },
    [update],
  );

  const resetWeek = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const fresh = createInitialState(stateRef.current.mode);
    stateRef.current = fresh;
    dirty.current = false;
    setState(fresh);
    try {
      clear(identityRef.current);
      setSaveError(null);
      setStatus("idle");
    } catch {
      setSaveError(STORAGE_FAILED);
      setStatus("error");
    }
  }, []);

  const restore = useCallback(
    (input: unknown) => {
      const result = validate(input);
      if (!result.ok) return { ok: false as const, problems: result.problems };
      dirty.current = true;
      stateRef.current = result.state;
      setState(result.state);
      writeNow(identityRef.current, result.state);
      return { ok: true as const };
    },
    [writeNow],
  );

  const backupJson = useCallback(() => JSON.stringify(state, null, 2), [state]);

  return {
    ready,
    identity,
    state,
    status,
    saveError,
    update,
    setMode,
    toggleFinding,
    visitRoom,
    resetWeek,
    restore,
    backupJson,
    flush,
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
