import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveProject, runWorkload } from "./capstone.functions";
import { normalizeState, type Phase3State } from "./project-state";
import { useRefreshWorkspace, type Workspace } from "./useWorkspace";
import type { ExecutionRun } from "./project-state";

interface DraftCtx {
  draft: Phase3State;
  dirty: boolean;
  saving: boolean;
  status: string | null;
  error: string | null;
  update: (fn: (state: Phase3State) => void) => void;
  save: (note?: string) => Promise<void>;
  execute: (instanceId: string) => Promise<ExecutionRun | null>;
  projectId: string;
  revision: number;
}

const Ctx = createContext<DraftCtx | null>(null);

export function useDraft(): DraftCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDraft must be used inside DraftProvider");
  return ctx;
}

export function DraftProvider({
  project,
  children,
}: {
  project: NonNullable<Workspace["project"]>;
  children: ReactNode;
}) {
  const refresh = useRefreshWorkspace();
  const doSave = useServerFn(saveProject);
  const doRun = useServerFn(runWorkload);
  const [draft, setDraft] = useState<Phase3State>(() => normalizeState(project.state));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastRevision = useRef(project.revision);

  useEffect(() => {
    if (project.revision !== lastRevision.current) {
      lastRevision.current = project.revision;
      setDraft(normalizeState(project.state));
      setDirty(false);
    }
  }, [project.revision, project.state]);

  const update = useCallback((fn: (state: Phase3State) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
    setStatus(null);
  }, []);

  const save = useCallback(
    async (note?: string) => {
      setSaving(true);
      setError(null);
      try {
        const res = await doSave({ data: { projectId: project.id, state: draft, ...(note ? { note } : {}) } });
        lastRevision.current = res.revision;
        setDraft(normalizeState(res.state));
        setDirty(false);
        setStatus(`Saved as revision ${res.revision}.`);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      } finally {
        setSaving(false);
      }
    },
    [doSave, draft, project.id, refresh],
  );

  const execute = useCallback(
    async (instanceId: string) => {
      setSaving(true);
      setError(null);
      try {
        const res = await doRun({ data: { projectId: project.id, state: draft, instanceId } });
        lastRevision.current = res.revision;
        setDraft(normalizeState(res.state));
        setDirty(false);
        setStatus(`Run ${res.run.id}: ${res.run.result}`);
        await refresh();
        return res.run as ExecutionRun;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Run failed.");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [doRun, draft, project.id, refresh],
  );

  return (
    <Ctx.Provider
      value={{
        draft,
        dirty,
        saving,
        status,
        error,
        update,
        save,
        execute,
        projectId: project.id,
        revision: project.revision,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
