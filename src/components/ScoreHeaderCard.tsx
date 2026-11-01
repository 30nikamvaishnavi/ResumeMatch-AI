import React from 'react';
import { Award, CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';
import type { AnalysisStats } from '../types.ts';

interface ScoreHeaderCardProps {
  overallScore: number;
  scoreReasons: string[];
  stats: AnalysisStats;
}

export const ScoreHeaderCard: React.FC<ScoreHeaderCardProps> = ({
  overallScore,
  scoreReasons,
  stats,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (score >= 60) return { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-800 border-rose-200' };
  };

  const colors = getScoreColor(overallScore);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Score Ring / Number */}
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-slate-900 text-white shrink-0 shadow-inner">
            <div className="text-center">
              <div className="text-3xl font-extrabold tracking-tight">{overallScore}%</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Match Score</div>
            </div>
            <div
              className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full ${colors.bg} border-2 border-white`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Overall Qualification Alignment</h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Synthesized by Gemini based on semantic fulfillment of requirements and strict verbatim verification.
            </p>
          </div>
        </div>

        {/* Dynamic Chips - Exact agreement with derived stats */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{stats.matchedCount} Fully Matched</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{stats.partialCount} Partial Match{stats.partialCount === 1 ? '' : 'es'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{stats.highPriorityMissingCount} High-Priority Missing</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            <span>{stats.totalRequirements} Evaluated</span>
          </div>
        </div>
      </div>

      {/* Derived Score Reasons Sentences */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span>Derived Score Reasons (Directly computed from verified lists)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {scoreReasons.map((reason, idx) => (
            <div
              key={idx}
              className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 border border-slate-100 flex items-start gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
              <span className="leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
