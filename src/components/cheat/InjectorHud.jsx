import React, { useState } from "react";
import { Crosshair, Zap, Pencil, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { riskColor } from "@/utils/cheatColors";

export default function InjectorHud({ cheats, onInject, onClose }) {
  const [view, setView] = useState("list");
  const [editIndex, setEditIndex] = useState(null);
  const [editCode, setEditCode] = useState("");

  const startEdit = (i) => {
    setEditIndex(i);
    setEditCode(cheats[i]?.code || "");
    setView("edit");
  };

  const injectEdited = () => {
    const c = cheats[editIndex];
    if (!c) return;
    onInject({ ...c, code: editCode });
  };

  return (
    <div className="absolute bottom-3 left-3 z-30 w-[340px] max-w-[92%] max-h-[72%] flex flex-col bg-slate-900/95 backdrop-blur border border-emerald-700/50 rounded-lg shadow-2xl shadow-emerald-900/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-emerald-800/50">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-300">Injector HUD</span>
          <span className="text-[10px] text-slate-500 font-mono">{cheats.length} cheats</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-lg leading-none px-1">×</button>
      </div>

      {view === "list" ? (
        <div className="overflow-auto p-2 space-y-1.5">
          {!cheats.length ? (
            <p className="text-xs text-slate-500 p-2">No cheats yet — run Analyze or load a profile.</p>
          ) : (
            cheats.map((c, i) => (
              <div key={i} className="border border-slate-800 rounded bg-slate-900/60 p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-100 flex-1 truncate">{c.title}</span>
                  <span className={riskColor(c.risk)}>{c.risk}</span>
                </div>
                {c.description && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{c.description}</p>}
                <div className="flex gap-1.5 mt-2">
                  <Button size="sm" onClick={() => onInject(c)} className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-xs flex-1">
                    <Zap className="w-3 h-3 mr-1" /> Inject
                  </Button>
                  <Button size="sm" onClick={() => startEdit(i)} className="bg-slate-700 hover:bg-slate-600 text-slate-100 h-7 text-xs">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-slate-800">
            <button onClick={() => setView("list")} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-xs font-mono text-slate-200 truncate">{cheats[editIndex]?.title}</span>
          </div>
          <textarea
            value={editCode}
            onChange={(e) => setEditCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-slate-950 text-emerald-300 font-mono text-[11px] p-2 border-0 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-700 min-h-[160px]"
          />
          <div className="p-2 border-t border-slate-800">
            <Button size="sm" onClick={injectEdited} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs">
              <Zap className="w-3.5 h-3.5 mr-1" /> Inject edited code
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}