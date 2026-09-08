import React from "react";
import { StockData } from "../types";
import { BellRing, X, ArrowRight, Volume2 } from "lucide-react";
import { playAlertChime } from "../utils/notifications";

export interface ActiveNotification {
  id: string;
  title: string;
  message: string;
  stock?: StockData;
  timestamp: string;
}

interface NotificationBannerProps {
  notifications: ActiveNotification[];
  onDismiss: (id: string) => void;
  onSelectStock?: (stock: StockData) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notifications,
  onDismiss,
  onSelectStock
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 space-y-2 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto p-3.5 rounded-2xl bg-[#131722]/95 border border-amber-500/80 shadow-2xl shadow-black/80 backdrop-blur-md text-white flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5 animate-pulse">
            <BellRing className="w-5 h-5 text-amber-300" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-300 font-mono tracking-tight flex items-center gap-1.5">
                <span>🚨 {notif.title}</span>
              </span>
              <button
                type="button"
                onClick={() => onDismiss(notif.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200 mt-1 leading-snug font-sans font-medium">
              {notif.message}
            </p>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <span className="text-slate-400 text-[10px]">{notif.timestamp}</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playAlertChime()}
                  className="text-slate-400 hover:text-amber-300 flex items-center gap-1"
                  title="Replay alert chime"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chime</span>
                </button>

                {notif.stock && onSelectStock && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectStock(notif.stock!);
                      onDismiss(notif.id);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <span>View Card</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
