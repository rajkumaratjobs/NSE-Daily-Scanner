import React, { useState } from "react";
import { usePWAInstall } from "./usePWAInstall";
import { Download, Smartphone, X } from "lucide-react";

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <Smartphone className="w-3 h-3 text-emerald-400" />
        Android Installed
      </span>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          id="btn-install-pwa"
          onClick={install}
          className={`inline-flex items-center gap-1.5 rounded bg-amber-500 hover:bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950 font-mono transition-all ${className}`}
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          Install on Android
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          id="btn-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition font-mono ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          Install App
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-lg bg-[#0F1219] border border-slate-700 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-mono">
                <Smartphone className="w-4 h-4 text-amber-400" />
                Add to Home Screen
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-300 font-sans">
              1. Tap the <strong className="text-amber-400">Share</strong> icon in Safari toolbar.<br />
              2. Scroll down and select <strong className="text-white">Add to Home Screen</strong>.<br />
              3. Tap <strong className="text-amber-400">Add</strong> in the top-right corner.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded bg-slate-800 py-1.5 text-xs font-mono font-medium text-slate-200 hover:bg-slate-700 border border-slate-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
