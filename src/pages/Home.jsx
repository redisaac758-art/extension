const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect, useCallback } from "react";

import { Save, FolderOpen, Cpu, PanelRightOpen, PanelRightClose, Crosshair, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import InjectorHud from "@/components/cheat/InjectorHud";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UrlBar from "@/components/cheat/UrlBar";
import IframeView from "@/components/cheat/IframeView";
import AIDashboard from "@/components/cheat/AIDashboard";

const now = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

export default function Home() {
  const [url, setUrl] = useState("");
  const [contextType, setContextType] = useState("game");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [autoInject, setAutoInject] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [frameHtml, setFrameHtml] = useState("");
  const [loadingFrame, setLoadingFrame] = useState(false);
  const [hudOpen, setHudOpen] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const iframeRef = useRef(null);
  const initialProfile = useRef(null);

  const log = useCallback((text, kind = "info") => {
    setLogs((l) => [...l.slice(-200), { time: now(), text, kind }]);
  }, []);

  const loadProfiles = useCallback(async () => {
    try {
      const res = await db.entities.GameProfile.list("-updated_date", 50);
      setProfiles(res.data || res || []);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const runInFrame = useCallback((code) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) throw new Error("No embedded frame");
    return win.eval(code);
  }, []);

  const testCheat = useCallback((cheat) => {
    log(`Injecting: ${cheat.title}`, "action");
    try {
      runInFrame(cheat.code);
      if (cheat.verify_code) {
        try {
          const result = runInFrame(cheat.verify_code);
          const pass = !!result;
          log(`Verify ${pass ? "PASS" : "FAIL"} → ${JSON.stringify(result)}`, pass ? "success" : "error");
          return pass;
        } catch (ve) {
          log(`Verify error: ${ve.message}`, "error");
          return false;
        }
      }
      log(`Injected: ${cheat.title} (no verify check)`, "success");
      return true;
    } catch (e) {
      log(`Injection blocked (cross-origin): ${e.message}`, "error");
      return false;
    }
  }, [log, runInFrame]);

  const handleAnalyze = useCallback(async (deep = false) => {
    if (!url) return;
    setAnalyzing(true);
    log(`${deep ? "Deep scan" : "Analyzing"} ${url} [${contextType}]…`);
    try {
      const res = await db.functions.invoke("analyzePage", { url, context_type: contextType, deep });
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
      log(`Found ${data.variables?.length || 0} variables, ${data.cheats?.length || 0} cheats${deep ? " (deep)" : ""}`, "success");
      if (!data.siteInfo?.allows_framing) log("Target blocks framing — analysis only", "error");
      if (autoInject) {
        const safe = (data.cheats || []).filter((c) => c.risk === "safe");
        safe.forEach((c, i) => {
          setTimeout(() => {
            log(`Auto-injecting: ${c.title}`, "action");
            const ok = testCheat(c);
            log(`Auto result: ${ok ? "working" : "failed"}`, ok ? "success" : "error");
          }, 400 * (i + 1));
        });
      }
    } catch (e) {
      log(`Analyze failed: ${e.message}`, "error");
    } finally {
      setAnalyzing(false);
    }
  }, [url, contextType, autoInject, log, testCheat]);

  const loadTarget = useCallback(async (targetUrl) => {
    if (!targetUrl) return;
    setLoadingFrame(true);
    setFrameHtml("");
    log(`Proxying ${targetUrl}…`, "action");
    try {
      const res = await db.functions.invoke("proxyPage", { url: targetUrl });
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      setFrameHtml(data.html);
      setFrameKey((k) => k + 1);
      log(`Embedded "${data.title || targetUrl}" — same-origin, injections enabled`, "success");
    } catch (e) {
      log(`Load failed: ${e.message}`, "error");
    } finally {
      setLoadingFrame(false);
    }
  }, [log]);

  const handleLoad = useCallback(() => loadTarget(url), [url, loadTarget]);

  const handleInject = useCallback((cheat) => {
    testCheat(cheat);
  }, [testCheat]);

  const handleSaveProfile = useCallback(async () => {
    if (!url) return;
    const name = window.prompt("Profile name", analysis?.siteInfo?.title || url);
    if (!name) return;
    try {
      const res = await db.entities.GameProfile.create({
        name,
        url,
        context_type: contextType,
        tracked_variables: analysis?.variables || [],
        cheats: analysis?.cheats || [],
        last_summary: analysis?.summary || "",
        site_info: analysis?.siteInfo || {},
      });
      const id = res.data?.id || res.id;
      setActiveProfileId(id);
      log(`Saved profile: ${name}`, "success");
      loadProfiles();
    } catch (e) {
      log(`Save failed: ${e.message}`, "error");
    }
  }, [url, contextType, analysis, log, loadProfiles]);

  const handleLoadProfile = useCallback(async (id) => {
    setActiveProfileId(id);
    if (!id) return;
    try {
      const res = await db.entities.GameProfile.get(id);
      const p = res.data || res;
      setUrl(p.url);
      setContextType(p.context_type);
      setAnalysis({
        variables: p.tracked_variables || [],
        cheats: p.cheats || [],
        suggestions: [],
        summary: p.last_summary || "",
        siteInfo: p.site_info || {},
      });
      setHudOpen(true);
      log(`Loaded profile: ${p.name} — auto-loading site & HUD`, "action");
      loadTarget(p.url);
    } catch (e) {
      log(`Load profile failed: ${e.message}`, "error");
    }
  }, [log, loadTarget]);

  useEffect(() => {
    if (initialProfile.current) return;
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get("profile");
    if (pid) {
      initialProfile.current = pid;
      handleLoadProfile(pid);
    }
  }, [handleLoadProfile]);

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <header className="flex flex-col gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900/90 z-30">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h1 className="font-semibold tracking-tight text-sm">AI Cheat Engine</h1>
          </div>
          <div className="flex-1 min-w-0">
            <UrlBar
              url={url}
              setUrl={setUrl}
              contextType={contextType}
              setContextType={setContextType}
              onAnalyze={() => handleAnalyze(false)}
              analyzing={analyzing}
              onLoad={handleLoad}
              loading={loadingFrame}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/profiles" className="flex items-center gap-1 text-xs text-slate-300 hover:text-emerald-400 px-2 h-9">
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <Button
            onClick={() => setHudOpen((o) => !o)}
            size="sm"
            className={`h-9 text-xs ${hudOpen ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}
            title="Toggle Injector HUD"
          >
            <Crosshair className="w-3.5 h-3.5 mr-1" /> HUD
          </Button>
          <Select value={activeProfileId} onValueChange={handleLoadProfile}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-slate-100 h-9 text-xs">
              <FolderOpen className="w-3.5 h-3.5 mr-1" />
              <SelectValue placeholder="Profiles" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSaveProfile} disabled={!url} size="sm" className="bg-slate-700 hover:bg-slate-600 text-slate-100 h-9">
            <Save className="w-3.5 h-3.5 mr-1" /> Save
          </Button>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <IframeView
            url={url}
            srcDoc={frameHtml}
            iframeRef={iframeRef}
            onLoad={() => log("Frame loaded", "success")}
            framingWarning={analysis && !analysis.siteInfo?.allows_framing}
            frameKey={frameKey}
          />
        </div>

        {hudOpen && (
          <InjectorHud
            cheats={analysis?.cheats || []}
            onInject={handleInject}
            onClose={() => setHudOpen(false)}
          />
        )}

        {/* Toggle button */}
        <button
          onClick={() => setPanelOpen((o) => !o)}
          className={`absolute top-3 z-50 -translate-y-0 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-l-md p-1.5 transition-all ${panelOpen ? "right-[420px]" : "right-0"}`}
          title={panelOpen ? "Hide engine" : "Show engine"}
        >
          {panelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>

        {/* Engine drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-[420px] max-w-[88%] z-40 transition-transform duration-300 ${panelOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <AIDashboard
            analysis={analysis}
            logs={logs}
            onInject={handleInject}
            analyzing={analyzing}
            autoInject={autoInject}
            setAutoInject={setAutoInject}
            onDeepScan={() => handleAnalyze(true)}
            onClose={() => setPanelOpen(false)}
          />
        </div>
      </main>
    </div>
  );
}