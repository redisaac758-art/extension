import React, { useState } from "react";
import { Loader2, Brain, ListTree, Zap, ScrollText, FileText, Info, Compass, ScanSearch } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VariableTable from "@/components/cheat/VariableTable";
import CheatList from "@/components/cheat/CheatList";
import ActivityLog from "@/components/cheat/ActivityLog";
import Suggestions from "@/components/cheat/Suggestions";

export default function AIDashboard({ analysis, logs, onInject, analyzing, autoInject, setAutoInject, onDeepScan, onClose }) {
  const [tab, setTab] = useState("log");
  const siteInfo = analysis?.siteInfo;
  return (
    <div className="flex flex-col h-full bg-slate-950/95 backdrop-blur border-l border-slate-800">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-100">AI Engine</span>
          {analyzing && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
          {analysis?.deep && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-900/60 text-emerald-300 rounded font-mono">DEEP</span>}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-lg leading-none px-1">×</button>
      </div>

      <div className="px-3 py-1.5 flex items-center gap-2 border-b border-slate-800/60">
        <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
          <input type="checkbox" checked={autoInject} onChange={(e) => setAutoInject(e.target.checked)} className="accent-emerald-500" />
          Auto-inject safe cheats
        </label>
        <button
          onClick={onDeepScan}
          disabled={analyzing}
          className="ml-auto flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200 disabled:opacity-50"
        >
          <ScanSearch className="w-3.5 h-3.5" /> Deep Scan
        </button>
      </div>

      {siteInfo && (
        <div className="px-3 py-1.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
          <Info className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-[140px]">{siteInfo.title || "untitled"}</span>
          {siteInfo.technologies?.map((t) => (
            <span key={t} className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-300">{t}</span>
          ))}
          {!siteInfo.allows_framing && <span className="text-amber-400">no-frame</span>}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-5 bg-slate-900 rounded-none border-b border-slate-800 h-9">
          <TabsTrigger value="log" className="text-xs data-[state=active]:bg-slate-800"><ScrollText className="w-3.5 h-3.5" /></TabsTrigger>
          <TabsTrigger value="variables" className="text-xs data-[state=active]:bg-slate-800"><ListTree className="w-3.5 h-3.5" /></TabsTrigger>
          <TabsTrigger value="cheats" className="text-xs data-[state=active]:bg-slate-800"><Zap className="w-3.5 h-3.5" /></TabsTrigger>
          <TabsTrigger value="next" className="text-xs data-[state=active]:bg-slate-800"><Compass className="w-3.5 h-3.5" /></TabsTrigger>
          <TabsTrigger value="summary" className="text-xs data-[state=active]:bg-slate-800"><FileText className="w-3.5 h-3.5" /></TabsTrigger>
        </TabsList>
        <TabsContent value="log" className="flex-1 overflow-hidden mt-0 p-1">
          <ActivityLog logs={logs} />
        </TabsContent>
        <TabsContent value="variables" className="flex-1 overflow-hidden mt-0">
          <VariableTable variables={analysis?.variables} />
        </TabsContent>
        <TabsContent value="cheats" className="flex-1 overflow-hidden mt-0 p-1">
          <CheatList cheats={analysis?.cheats} onInject={onInject} />
        </TabsContent>
        <TabsContent value="next" className="flex-1 overflow-auto mt-0">
          <Suggestions suggestions={analysis?.suggestions} onDeepScan={onDeepScan} analyzing={analyzing} />
        </TabsContent>
        <TabsContent value="summary" className="flex-1 overflow-auto mt-0 p-3 text-xs text-slate-300 leading-relaxed">
          {analysis?.summary || <p className="text-slate-500">No session summary yet. Run a scan to generate one.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}