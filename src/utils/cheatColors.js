export function importanceColor(level) {
  switch (level) {
    case "critical": return "text-red-400 font-semibold";
    case "high": return "text-amber-400 font-semibold";
    case "medium": return "text-cyan-400";
    case "low": return "text-slate-400";
    default: return "text-slate-400";
  }
}

export function riskColor(level) {
  switch (level) {
    case "safe": return "text-emerald-400 text-[10px] uppercase";
    case "moderate": return "text-amber-400 text-[10px] uppercase";
    case "risky": return "text-red-400 text-[10px] uppercase";
    default: return "text-slate-400 text-[10px] uppercase";
  }
}