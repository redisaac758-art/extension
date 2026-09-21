import React from "react";
import { Play, Loader2, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CONTEXTS = [
  { value: "game", label: "Game" },
  { value: "education", label: "Education" },
  { value: "quiz", label: "Quiz" },
  { value: "webapp", label: "Web App" },
  { value: "other", label: "Other" },
];

export default function UrlBar({ url, setUrl, contextType, setContextType, onAnalyze, analyzing, onLoad, loading }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <div className="flex items-center gap-2 flex-1">
        <Target className="w-4 h-4 text-emerald-400 shrink-0" />
        <Input
          type="url"
          placeholder="https://target-site.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLoad()}
          className="font-mono text-sm bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
        />
      </div>
      <Select value={contextType} onValueChange={setContextType}>
        <SelectTrigger className="w-full sm:w-28 bg-slate-900/60 border-slate-700 text-slate-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
          {CONTEXTS.map((c) => (
            <SelectItem key={c.value} value={c.value} className="capitalize">{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onLoad} disabled={!url || loading} className="bg-slate-700 hover:bg-slate-600 text-slate-100">
        {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />} Load
      </Button>
      <Button onClick={onAnalyze} disabled={!url || analyzing} className="bg-emerald-600 hover:bg-emerald-500 text-white">
        {analyzing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
        Analyze
      </Button>
    </div>
  );
}