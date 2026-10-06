import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { ExecOption, W12Content, Week12File, Week12View } from "./model";
import { exportWeek12, exportWeek12File, refreshWeek12Source, saveWeek12Draft, setWeek12Volunteer, startOrResumeWeek12 } from "./week12.functions";

export type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; at: string } | { kind: "failed"; message: string } | { kind: "conflict" };

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export function useWeek12() {
  const start = useServerFn(startOrResumeWeek12);
  const save = useServerFn(saveWeek12Draft);
  const refresh = useServerFn(refreshWeek12Source);
  const vol = useServerFn(setWeek12Volunteer);
  const zip = useServerFn(exportWeek12);
  const file = useServerFn(exportWeek12File);

  const [view, setView] = useState<Week12View | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [content, setContentState] = useState<W12Content | null>(null);
  const [execOption, setExecState] = useState<ExecOption>("");
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const rev = useRef(0);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<{ content: W12Content | null; execOption: ExecOption }>({ content: null, execOption: "" });

  const adopt = useCallback((v: Week12View) => {
    setView(v);
    if (!dirty.current) {
      setContentState(v.content); setExecState(v.execOption);
      latest.current = { content: v.content, execOption: v.execOption };
      rev.current = v.textRevision;
    }
  }, []);

  useEffect(() => {
    start().then((r) => { if ("blocked" in r) setBlocked(true); else adopt(r.view); })
      .catch((e: Error) => setLoadError(e.message || "Could not open Week 12."));
  }, [start, adopt]);

  const flush = useCallback(async () => {
    if (!dirty.current || !latest.current.content) return;
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    setSaveState({ kind: "saving" });
    const payload = latest.current;
    try {
      const r = await save({ data: { expectedTextRevision: rev.current, execOption: payload.execOption, content: payload.content as never } });
      if ("conflict" in r && r.conflict) { setSaveState({ kind: "conflict" }); return; }
      rev.current = r.textRevision!;
      if (latest.current === payload) dirty.current = false;
      setSaveState({ kind: "saved", at: new Date(r.savedAt!).toLocaleTimeString() });
    } catch (e) { setSaveState({ kind: "failed", message: (e as Error).message || "Not saved." }); }
  }, [save]);

  const schedule = useCallback(() => {
    dirty.current = true;
    setSaveState({ kind: "idle" });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 1200);
  }, [flush]);

  const update = useCallback((fn: (c: W12Content) => W12Content) => {
    setContentState((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      latest.current = { ...latest.current, content: next };
      return next;
    });
    schedule();
  }, [schedule]);

  const chooseExec = useCallback((o: ExecOption) => {
    setExecState(o);
    latest.current = { ...latest.current, execOption: o };
    schedule();
  }, [schedule]);

  useEffect(() => {
    const onHide = () => { if (dirty.current) void flush(); };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => { window.removeEventListener("pagehide", onHide); document.removeEventListener("visibilitychange", onHide); };
  }, [flush]);

  const reloadAfterConflict = useCallback(async () => {
    const r = await start();
    if ("view" in r) { rev.current = r.view.textRevision; setView(r.view); setSaveState({ kind: "idle" }); if (dirty.current) void flush(); }
  }, [start, flush]);

  const refreshSource = useCallback(async () => {
    await flush();
    const r = await refresh({ data: { confirm: "REFRESH" } });
    setView(r.view);
  }, [refresh, flush]);

  const setVolunteer = useCallback(async (v: boolean) => {
    const r = await vol({ data: { volunteer: v } });
    setView((prev) => (prev ? { ...prev, volunteerStatus: r.volunteerStatus, presenterSelected: v ? prev.presenterSelected : false } : prev));
  }, [vol]);

  const downloadZip = useCallback(async () => {
    await flush();
    const r = await zip();
    download(new Blob([Uint8Array.from(atob(r.zipBase64), (c) => c.charCodeAt(0))], { type: "application/zip" }), r.filename);
    return r;
  }, [zip, flush]);

  const downloadFile = useCallback(async (f: Week12File) => {
    await flush();
    const r = await file({ data: { file: f } });
    download(new Blob([r.content], { type: f.endsWith(".json") ? "application/json" : "text/markdown;charset=utf-8" }), r.filename);
    return r;
  }, [file, flush]);

  return { view, blocked, loadError, content, execOption, update, chooseExec, saveState, flush, reloadAfterConflict, refreshSource, setVolunteer, downloadZip, downloadFile };
}

export type Week12Store = ReturnType<typeof useWeek12>;
