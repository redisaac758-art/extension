import React from "react";
import { importanceColor } from "@/utils/cheatColors";

export default function VariableTable({ variables }) {
  if (!variables?.length) {
    return <p className="text-xs text-slate-500 p-3">No variables tracked yet. Run Analyze.</p>;
  }
  return (
    <div className="overflow-auto max-h-[calc(100vh-320px)]">
      <table className="w-full text-xs font-mono">
        <thead className="sticky top-0 bg-slate-900 text-slate-400">
          <tr className="text-left border-b border-slate-800">
            <th className="px-2 py-1.5 font-medium">Variable</th>
            <th className="px-2 py-1.5 font-medium">Selector / Path</th>
            <th className="px-2 py-1.5 font-medium">Importance</th>
            <th className="px-2 py-1.5 font-medium">Category</th>
          </tr>
        </thead>
        <tbody>
          {variables.map((v, i) => (
            <tr key={i} className="border-b border-slate-800/60 hover:bg-slate-800/40">
              <td className="px-2 py-1.5 text-slate-100">{v.name}</td>
              <td className="px-2 py-1.5 text-emerald-400 truncate max-w-[180px]" title={v.selector}>{v.selector || "—"}</td>
              <td className="px-2 py-1.5">
                <span className={importanceColor(v.importance)}>{v.importance}</span>
              </td>
              <td className="px-2 py-1.5 text-slate-400">{v.category || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}