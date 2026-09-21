import React, { useEffect, useRef } from "react";
import { Activity } from "lucide-react";

export default function ActivityLog({ logs }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  return (
    <div className="overflow-auto max-h-[calc(100vh-320px)] font-mono text-[11px] space-y-1 p-1">
      {logs.length === 0 && (
        <p className="text-slate-600 p-2">AI idle. Activity will appear here as the engine watches.</p>
      )}
      {logs.map((l, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-slate-600 shrink-0">{l.time}</span>
          <span className={l.kind === "error" ? "text-red-400" : l.kind === "success" ? "text-emerald-400" : l.kind === "action" ? "text-cyan-400" : "text-slate-300"}>
            {l.kind === "error" ? "✗" : l.kind === "success" ? "✓" : l.kind === "action" ? "▶" : "•"} {l.text}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}