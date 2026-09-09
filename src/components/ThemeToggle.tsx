import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../utils/themeContext";

interface ThemeToggleProps {
  className?: string;
  variant?: "pill" | "segmented" | "compact";
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  variant = "pill",
  showLabel = true,
}) => {
  const { theme, toggleTheme, setTheme, isBright } = useTheme();

  if (variant === "segmented") {
    return (
      <div
        id="theme-toggle-segmented"
        className={`inline-flex items-center rounded-xl bg-slate-900/90 border border-slate-800 p-1 text-xs font-mono select-none ${className}`}
        role="group"
        aria-label="Theme mode switcher"
      >
        <button
          type="button"
          onClick={() => setTheme("night")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium cursor-pointer ${
            !isBright
              ? "bg-slate-800 text-amber-300 font-semibold shadow-sm border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
          aria-pressed={!isBright}
          title="Switch to Night Mode"
        >
          <Moon className="w-3.5 h-3.5 text-amber-400" />
          <span>Night Mode</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("bright")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium cursor-pointer ${
            isBright
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
          aria-pressed={isBright}
          title="Switch to Bright Mode (Day)"
        >
          <Sun className="w-3.5 h-3.5 text-amber-950" />
          <span>Bright Mode (Day)</span>
        </button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <button
        id="theme-toggle-compact"
        type="button"
        onClick={toggleTheme}
        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isBright
            ? "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 shadow-sm"
            : "bg-slate-800/90 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300"
        } ${className}`}
        aria-label={isBright ? "Switch to Night Mode" : "Switch to Bright Mode (Day)"}
        title={isBright ? "Switch to Night Mode" : "Switch to Bright Mode (Day)"}
      >
        {isBright ? (
          <Sun className="w-4 h-4 text-amber-600 stroke-[2.2] animate-scaleUp" />
        ) : (
          <Moon className="w-4 h-4 text-amber-400 stroke-[2.2] animate-scaleUp" />
        )}
      </button>
    );
  }

  // Default "pill" variant
  return (
    <button
      id="theme-toggle-pill"
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-medium cursor-pointer select-none ${
        isBright
          ? "bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100 shadow-sm"
          : "bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700"
      } ${className}`}
      aria-label={isBright ? "Active: Bright Mode (Day). Click for Night Mode" : "Active: Night Mode. Click for Bright Mode (Day)"}
      title={isBright ? "Click to switch to Night Mode" : "Click to switch to Bright Mode (Day)"}
    >
      <div
        className={`p-1 rounded-lg transition-transform ${
          isBright ? "bg-amber-400 text-slate-950 rotate-90" : "bg-slate-900 text-amber-400"
        }`}
      >
        {isBright ? (
          <Sun className="w-3.5 h-3.5 stroke-[2.4]" />
        ) : (
          <Moon className="w-3.5 h-3.5 stroke-[2.2]" />
        )}
      </div>

      {showLabel && (
        <div className="flex flex-col text-left leading-tight">
          <span className="font-semibold text-[11px]">
            {isBright ? "Bright Mode" : "Night Mode"}
          </span>
          <span className="text-[9px] text-slate-400">
            {isBright ? "Day Mode" : "Dark Mode"}
          </span>
        </div>
      )}
    </button>
  );
};
