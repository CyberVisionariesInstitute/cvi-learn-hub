import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Command } from "./engine";
import type { AttemptView, Learner } from "./types";
import {
  captureWeek11Evidence, executeWeek11Command, exportWeek11, resetWeek11, saveWeek11Text, startOrResumeWeek11,
} from "./week11.functions";

export type TextSave = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; at: string } | { kind: "failed"; message: string } | { kind: "conflict" };

const key = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export function useWeek11() {
  const start = useServerFn(startOrResumeWeek11);
  const exec = useServerFn(executeWeek11Command);
  const capture = useServerFn(captureWeek11Evidence);
  const saveText = useServerFn(saveWeek11Text);
  const doExport = useServerFn(exportWeek11);
  const doReset = useServerFn(resetWeek11);

  const [view, setView] = useState<AttemptView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<{ ok: boolean; message: string; testId?: string; sessionKey?: string; challengeKey?: string; conflict?: string } | null>(null);
  const [learner, setLearnerState] = useState<Learner>({});
  const [textSave, setTextSave] = useState<TextSave>({ kind: "idle" });
  const textRev = useRef(0);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<Learner>({});

  const adopt = useCallback((v: AttemptView, replaceText = false) => {
    setView(v);
    if (replaceText || !dirty.current) {
      setLearnerState(v.learner);
      latest.current = v.learner;
      textRev.current = v.textRevision;
    }
  }, []);

  useEffect(() => {
    (start() as Promise<AttemptView>).then((v) => adopt(v, true)).catch((e: Error) => setLoadError(e.message || "Could not load your attempt."));
  }, [start, adopt]);

  const flush = useCallback(async () => {
    if (!dirty.current) return;
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    setTextSave({ kind: "saving" });
    const payload = latest.current;
    try {
      const r = await saveText({ data: { expectedTextRevision: textRev.current, learner: payload } });
      if ("conflict" in r && r.conflict) {
        setTextSave(r.conflict === "TOO_LONG" ? { kind: "failed", message: "Too long to save — shorten some answers. Your text is still here." } : { kind: "conflict" });
        return;
      }
      textRev.current = r.textRevision;
      if (latest.current === payload) dirty.current = false;
      setTextSave({ kind: "saved", at: new Date(r.savedAt!).toLocaleTimeString() });
    } catch (e) {
      setTextSave({ kind: "failed", message: (e as Error).message || "Not saved." });
    }
  }, [saveText]);

  const setLearner = useCallback((fn: (l: Learner) => Learner) => {
    setLearnerState((prev) => {
      const next = fn(prev);
      latest.current = next;
      return next;
    });
    dirty.current = true;
    setTextSave({ kind: "idle" });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 1200);
  }, [flush]);

  useEffect(() => {
    const onHide = () => { if (dirty.current) void flush(); };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => { window.removeEventListener("pagehide", onHide); document.removeEventListener("visibilitychange", onHide); };
  }, [flush]);

  const reloadAfterConflict = useCallback(async () => {
    const v = (await start()) as AttemptView;
    textRev.current = v.textRevision;
    setView(v);
    setTextSave({ kind: "idle" });
    if (dirty.current) void flush();
  }, [start, flush]);

  const run = useCallback(async (command: Command) => {
    if (!view) return null;
    setBusy(true);
    try {
      const r = (await exec({ data: { expectedRevision: view.revision, idempotencyKey: key(), command: command as never } })) as { view: AttemptView; conflict?: string; result?: unknown };
      adopt(r.view);
      if ("conflict" in r && r.conflict) {
        const msg = r.conflict === "STATE_CHANGED" ? "The simulator changed in another tab. Review the current values and try again." : "That action could not be applied.";
        setLastResult({ ok: false, message: msg, conflict: r.conflict });
        return null;
      }
      const res = r.result as { ok: boolean; message: string; testId?: string; sessionKey?: string; challengeKey?: string };
      setLastResult(res);
      return res;
    } catch (e) {
      setLastResult({ ok: false, message: `Not saved: ${(e as Error).message}` });
      return null;
    } finally { setBusy(false); }
  }, [exec, view, adopt]);

  const captureEvidence = useCallback(async (input: { mission: string; slot: string; title: string; refs: { accounts: string[]; groups: string[]; tests: string[]; signins: string[]; audits: string[]; tickets: string[]; historical: string[] }; caption: string }) => {
    await flush();
    setBusy(true);
    try { const v = (await capture({ data: input })) as AttemptView; adopt(v, true); setLastResult({ ok: true, message: `Captured ${input.slot}.` }); }
    catch (e) { setLastResult({ ok: false, message: (e as Error).message }); }
    finally { setBusy(false); }
  }, [capture, adopt, flush]);

  const exportZip = useCallback(async () => {
    await flush();
    const r = await doExport();
    const bin = Uint8Array.from(atob(r.zipBase64), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bin], { type: "application/zip" }));
    const a = document.createElement("a");
    a.href = url; a.download = `week-11-portfolio${r.draft ? "-DRAFT" : ""}.zip`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return r;
  }, [doExport, flush]);

  const reset = useCallback(async (reason: string) => {
    if (!view) return;
    await flush();
    const r = (await doReset({ data: { expectedRevision: view.revision, idempotencyKey: key(), confirm: "RESET", reason } })) as { view?: AttemptView; conflict?: string };
    if ("view" in r && r.view) { dirty.current = false; adopt(r.view, true); setLastResult({ ok: true, message: "New attempt started. Your previous attempt is archived and read-only." }); }
    else setLastResult({ ok: false, message: "Reset did not happen; your attempt is unchanged." });
  }, [view, doReset, adopt, flush]);

  return { view, loadError, busy, lastResult, setLastResult, run, learner, setLearner, textSave, flush, reloadAfterConflict, captureEvidence, exportZip, reset };
}

export type Week11Store = ReturnType<typeof useWeek11>;
