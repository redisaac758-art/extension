const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useCallback } from "react";

import { useNavigate, Link } from "react-router-dom";
import { Cpu, Play, Trash2, Plus, ArrowLeft, ListTree, Zap, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { riskColor, importanceColor } from "@/utils/cheatColors";

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await db.entities.GameProfile.list("-updated_date", 100);
      setProfiles(res.data || res || []);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLoad = (id) => navigate(`/?profile=${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this profile?")) return;
    try {
      await db.entities.GameProfile.delete(id);
      load();
    } catch (e) {
      window.alert("Delete failed: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
        <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-emerald-400">
          <ArrowLeft className="w-4 h-4" /> <span className="text-sm">Engine</span>
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <h1 className="font-semibold tracking-tight text-base">Game Profiles & Data Dashboard</h1>
        </div>
        <Link to="/" className="ml-auto">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white h-9">
            <Plus className="w-4 h-4 mr-1" /> New scan
          </Button>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading profiles…</p>
        ) : !profiles.length ? (
          <div className="text-center py-20 text-slate-500">
            <p className="mb-2">No saved profiles yet.</p>
            <Link to="/" className="text-emerald-400 hover:underline">Scan a site and save it →</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {profiles.map((p) => (
              <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                <div className="flex items-start justify-between px-4 py-3 border-b border-slate-800">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-100 truncate">{p.name}</h2>
                    <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 truncate">
                      <Globe className="w-3 h-3 shrink-0" /> <span className="truncate">{p.url}</span>
                    </a>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-slate-800 rounded text-slate-400 shrink-0 ml-2">{p.context_type}</span>
                </div>

                <div className="px-4 py-3 space-y-3 flex-1">
                  {p.site_info?.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.site_info.technologies.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-slate-300">{t}</span>
                      ))}
                    </div>
                  )}

                  {p.last_summary && (
                    <div className="flex gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 line-clamp-3">{p.last_summary}</p>
                    </div>
                  )}

                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1 text-slate-400"><ListTree className="w-3.5 h-3.5" /> {(p.tracked_variables || []).length} variables</span>
                    <span className="flex items-center gap-1 text-slate-400"><Zap className="w-3.5 h-3.5" /> {(p.cheats || []).length} cheats</span>
                  </div>

                  {p.tracked_variables?.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 mb-1">Tracked variables</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.tracked_variables.slice(0, 8).map((v, i) => (
                          <span key={i} className={`text-[10px] px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded ${importanceColor(v.importance)}`}>
                            {v.name}
                          </span>
                        ))}
                        {p.tracked_variables.length > 8 && <span className="text-[10px] text-slate-500 self-center">+{p.tracked_variables.length - 8}</span>}
                      </div>
                    </div>
                  )}

                  {p.cheats?.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 mb-1">Saved cheats</p>
                      <ul className="space-y-1">
                        {p.cheats.slice(0, 5).map((c, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs">
                            <span className="font-mono text-slate-300 truncate flex-1">{c.title}</span>
                            <span className={riskColor(c.risk)}>{c.risk}</span>
                          </li>
                        ))}
                        {p.cheats.length > 5 && <li className="text-[10px] text-slate-500">+{p.cheats.length - 5} more</li>}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 px-4 py-3 border-t border-slate-800 bg-slate-950/40">
                  <Button size="sm" onClick={() => handleLoad(p.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 flex-1">
                    <Play className="w-3.5 h-3.5 mr-1" /> Load profile
                  </Button>
                  <Button size="sm" onClick={() => handleDelete(p.id)} className="bg-slate-800 hover:bg-red-900 text-slate-300 hover:text-red-300 h-8">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}