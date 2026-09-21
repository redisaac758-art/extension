import React from "react";
import { Compass, ArrowRight } from "lucide-react";

export default function Suggestions({ suggestions, onDeepScan, analyzing }) {
  if (!suggestions?.length) {
    return <p className="text-xs text-slate-500 p-3">No next-step suggestions yet. Run a scan to get AI guidance on where to look deeper.</p>;
  }
  return (
    <div className="space-y-2 p-2">
      <div className="flex items-center gap-2 px-1">
        <Compass className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs text-slate-300">Go deeper for the best results:</span>
      </div>
      {suggestions.map((s, i) => (
        <div key={i} className="border border-slate-800 rounded bg-slate-900/50 p-2">
          <p className="text-xs font-mono text-slate-100">{s.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-start gap-1">
            <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-emerald-400" />
            {s.action}
          </p>
        </div>
      ))}
      <button
        onClick={onDeepScan}
        disabled={analyzing}
        className="w-full mt-1 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded py-1.5 font-medium"
      >
        {analyzing ? "Deep scanning…" : "Run Deep Scan now"}
      </button>
    </div>
  );
}