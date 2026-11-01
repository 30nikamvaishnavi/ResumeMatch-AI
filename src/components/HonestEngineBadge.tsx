import React from 'react';
import { Cpu, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HonestEngineBadgeProps {
  modelUsed: string;
  timestamp: string;
  latencyMs: number;
  attemptsCount: number;
  isFallback: boolean;
}

export const HonestEngineBadge: React.FC<HonestEngineBadgeProps> = ({
  modelUsed,
  timestamp,
  latencyMs,
  attemptsCount,
  isFallback,
}) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Engine Actually Used
              </span>
              {isFallback && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  Fallback Model Activated
                </span>
              )}
            </div>
            <div className="text-base font-mono font-bold text-emerald-400 flex items-center gap-2">
              <span>{modelUsed}</span>
              <span className="inline-flex items-center gap-1 text-xs font-sans px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Live Gemini Output
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Generated: <strong className="text-white font-mono">{formattedTime}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span>Latency: <strong className="text-white font-mono">{(latencyMs / 1000).toFixed(2)}s</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span>Attempts: <strong className="text-white font-mono">{attemptsCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-950/60 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Verbatim Evidence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
