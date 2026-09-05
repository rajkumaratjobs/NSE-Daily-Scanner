import React, { useState, useEffect } from "react";
import { FileCode2, Copy, Check, Terminal, ExternalLink, Download } from "lucide-react";

export const PythonFilesViewer: React.FC = () => {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string>("main.py");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch("/api/python-files");
        const data = await res.json();
        if (data.files) {
          setFiles(data.files);
        }
      } catch (err) {
        console.error("Failed to load python files:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFiles();
  }, []);

  const handleCopy = () => {
    if (files[selectedFile]) {
      navigator.clipboard.writeText(files[selectedFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!files[selectedFile]) return;
    const blob = new Blob([files[selectedFile]], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fileKeys = ["main.py", "scanner.py", "config.json", "requirements.txt", "Dockerfile", "README.md", ".env.example"];

  return (
    <div className="space-y-3">
      {/* Quick Launch Guide Banner */}
      <div className="rounded-lg bg-[#0F1219] border border-slate-800 p-3.5">
        <h3 className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>Complete Python 3.11 Backend Daemon</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-1 font-sans">
          These production-ready Python files are generated and live in the workspace root. You can run them on Replit, Google Cloud Run, local PC, or Android Termux.
        </p>

        <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#0B0E14] border border-slate-800 text-slate-300">
            python main.py --scan-now
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0B0E14] border border-slate-800 text-slate-300">
            python main.py --daemon
          </span>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {fileKeys.map(fileName => (
          <button
            key={fileName}
            onClick={() => setSelectedFile(fileName)}
            className={`px-2.5 py-1 rounded text-xs font-mono shrink-0 transition flex items-center gap-1.5 ${
              selectedFile === fileName
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold"
                : "bg-[#0F1219] text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>{fileName}</span>
          </button>
        ))}
      </div>

      {/* Code Viewer */}
      <div className="rounded-lg bg-[#0B0E14] border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#0F1219] border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500/80" />
            <span className="w-2 h-2 rounded-full bg-amber-500/80" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
            <span className="font-mono text-slate-300 font-medium ml-1 text-xs">{selectedFile}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition"
            >
              <Download className="w-3 h-3" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="p-3.5 max-h-[460px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed select-all">
          {loading ? (
            <div className="text-slate-500 py-8 text-center">Loading {selectedFile}...</div>
          ) : files[selectedFile] ? (
            <pre className="whitespace-pre">{files[selectedFile]}</pre>
          ) : (
            <div className="text-slate-500 py-8 text-center">File content unavailable</div>
          )}
        </div>
      </div>

      {/* Deployment quick-links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 rounded bg-[#0F1219] border border-slate-800">
          <div className="font-semibold text-white mb-0.5 font-mono text-xs">Google Cloud Run</div>
          <p className="text-[11px] text-slate-400 font-sans">
            Use Dockerfile or Cloud Run Jobs to trigger daily at 9:00 AM IST via Cloud Scheduler.
          </p>
        </div>

        <div className="p-2.5 rounded bg-[#0F1219] border border-slate-800">
          <div className="font-semibold text-white mb-0.5 font-mono text-xs">Replit 24/7 Repl</div>
          <p className="text-[11px] text-slate-400 font-sans">
            Import repo, add Secrets for GEMINI_API_KEY & Telegram, run <code className="text-amber-400 font-mono text-[10px]">main.py --daemon</code>.
          </p>
        </div>

        <div className="p-2.5 rounded bg-[#0F1219] border border-slate-800">
          <div className="font-semibold text-white mb-0.5 font-mono text-xs">Local PC / Termux</div>
          <p className="text-[11px] text-slate-400 font-sans">
            Run on Android via Termux or background systemd service on Linux / Windows.
          </p>
        </div>
      </div>
    </div>
  );
};
