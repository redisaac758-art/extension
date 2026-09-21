import React from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";

export default function IframeView({ url, srcDoc, iframeRef, onLoad, framingWarning, frameKey }) {
  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
        <span className="text-xs font-mono text-slate-400 truncate">{url || "no target loaded"}</span>
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
      {framingWarning && !srcDoc && (
        <div className="flex items-start gap-2 px-3 py-2 bg-amber-950/60 border-b border-amber-800 text-amber-200 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>This site blocks direct embedding. Click <strong>Load</strong> to proxy it through our origin — injections will work and the page will render here.</span>
        </div>
      )}
      <div className="flex-1 relative">
        {srcDoc ? (
          <iframe
            key={frameKey || 'doc'}
            ref={iframeRef}
            srcDoc={srcDoc}
            onLoad={onLoad}
            className="absolute inset-0 w-full h-full bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            title="target"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
            Enter a URL and click Load to embed a target site.
          </div>
        )}
      </div>
    </div>
  );
}