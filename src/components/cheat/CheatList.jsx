import React, { useState } from "react";
import { ChevronDown, ChevronRight, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { riskColor } from "@/utils/cheatColors";

export default function CheatList({ cheats, onInject }) {
  const [open, setOpen] = useState({});
  if (!cheats?.length) {
    return <p className="text-xs text-slate-500 p-3">No cheats suggested yet. Run Analyze.</p>;
  }
  return (
    <div className="overflow-auto max-h-[calc(100vh-320px)] space-y-1.5">
      {cheats.map((c, i) => (
        <div key={i} className="border border-slate-800 rounded bg-slate-900/50">
          <button
            onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
          >
            {open[i] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono text-slate-100 flex-1 truncate">{c.title}</span>
            <span className={riskColor(c.risk)}>{c.risk}</span>
          </button>
          {open[i] && (
            <div className="px-2 pb-2 space-y-2">
              {c.description && <p className="text-xs text-slate-400">{c.description}</p>}
              <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 border border-slate-800 rounded p-2 overflow-auto whitespace-pre-wrap">{c.code}</pre>
              <Button
                size="sm"
                onClick={() => onInject(c)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-xs"
              >
                <Zap className="w-3 h-3 mr-1" /> Inject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}