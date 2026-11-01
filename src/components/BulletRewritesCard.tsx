import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight, AlertCircle, Check } from 'lucide-react';
import type { BulletRewriteItem } from '../types.ts';

interface BulletRewritesCardProps {
  rewrites: BulletRewriteItem[];
  rewritesNotice?: string;
}

export const BulletRewritesCard: React.FC<BulletRewritesCardProps> = ({ rewrites, rewritesNotice }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Verifiable Bullet Enhancements (Experience & Projects Only)
            </h3>
            <p className="text-xs text-slate-500">
              Only rewrites genuine experience bullets. Zero fabricated tools, zero unmentioned technologies.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero Invented Tools Code-Verified
          </span>
        </div>
      </div>

      {rewritesNotice && (
        <div className="mb-4 bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-950">Notice on Candidate Selection:</span>{' '}
            {rewritesNotice}
          </div>
        </div>
      )}

      {rewrites.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          No candidate bullets found in Experience or Project sections of this resume.
        </div>
      ) : (
        <div className="space-y-4">
          {rewrites.map((rw, index) => (
            <div
              key={rw.id}
              className="bg-slate-50/70 rounded-xl border border-slate-200/90 p-4 transition-all hover:border-slate-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Bullet #{index + 1} • {rw.section}
                </span>
                <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                  <Check className="w-3 h-3 text-indigo-600" />
                  Facts Preserved • Placeholders [X] for User Measurement
                </span>
              </div>

              {/* Original Bullet (Never truncated with ...) */}
              <div className="mb-3">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Full Original Bullet from Resume
                </div>
                <div className="text-sm font-serif text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                  "{rw.original}"
                </div>
              </div>

              {/* Critique */}
              <div className="mb-3 text-xs text-slate-600 flex items-start gap-1.5 bg-slate-100/60 p-2.5 rounded-lg">
                <span className="font-semibold text-slate-800 shrink-0">Analysis & Critique:</span>
                <span className="leading-relaxed">{rw.critique}</span>
              </div>

              {/* Full Rewritten Bullet (Never truncated with ...) */}
              <div>
                <div className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider mb-1 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enhanced High-Impact Phrasing</span>
                </div>
                <div className="text-sm font-serif text-emerald-950 font-medium bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 leading-relaxed">
                  "{rw.rewrite}"
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
