import React, { useState } from 'react';
import { Sparkles, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import type { RewriteSuggestion } from '../types.ts';

interface RewriteSuggestionsCardProps {
  suggestions: RewriteSuggestion[];
}

export const RewriteSuggestionsCard: React.FC<RewriteSuggestionsCardProps> = ({ suggestions }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Bullet Rewrite Suggestions</h3>
            <p className="text-xs text-slate-500">
              Before/after enhancement cards with zero invented facts and verified fact preservation
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          No Hallucinated Tools • Placeholders [X%]
        </span>
      </div>

      <div className="space-y-5">
        {suggestions.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 transition-all hover:border-slate-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Suggestion #{idx + 1}
              </span>
              <button
                onClick={() => handleCopy(item.improved, idx)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Improved Bullet</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before Card */}
              <div className="bg-white rounded-xl p-4 border border-rose-100 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] uppercase font-bold text-rose-500 tracking-wider mb-1.5">
                    Original Bullet (From Resume)
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-serif">
                    "{item.original}"
                  </p>
                </div>
                {item.critique && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                    Critique: {item.critique}
                  </div>
                )}
              </div>

              {/* After Card */}
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider mb-1.5 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                    <span>Improved Version</span>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed font-serif">
                    "{item.improved}"
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-100 text-[10px] text-emerald-700">
                  *Uses [X%] for metrics to be measured by candidate. Never invents experience.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
