import React from 'react';
import { BarChart3, Wrench, Briefcase, GraduationCap, KeyRound } from 'lucide-react';
import type { ScoreBreakdown } from '../types.ts';

interface ScoreBreakdownBarChartProps {
  breakdown: ScoreBreakdown;
}

export const ScoreBreakdownBarChart: React.FC<ScoreBreakdownBarChartProps> = ({ breakdown }) => {
  const categories = [
    {
      key: 'skills_match',
      label: 'Skills Match',
      icon: Wrench,
      data: breakdown.skills_match,
      color: 'bg-indigo-600',
      lightColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      key: 'experience_match',
      label: 'Experience Match',
      icon: Briefcase,
      data: breakdown.experience_match,
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      key: 'education_match',
      label: 'Education Match',
      icon: GraduationCap,
      data: breakdown.education_match,
      color: 'bg-sky-600',
      lightColor: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      key: 'keywords_match',
      label: 'Keywords & ATS Match',
      icon: KeyRound,
      data: breakdown.keywords_match,
      color: 'bg-amber-600',
      lightColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Match Score Breakdown</h3>
            <p className="text-xs text-slate-500">
              Evaluated across four core dimensions with plain-language rationales
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const score = cat.data?.score ?? 0;
          const reason = cat.data?.reason ?? 'No detailed rationale provided.';

          return (
            <div key={cat.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">{score}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className={`h-full rounded-full ${cat.color} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>

              {/* One-sentence reason */}
              <p className="text-xs text-slate-600 leading-relaxed pl-6 italic">
                "{reason}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
