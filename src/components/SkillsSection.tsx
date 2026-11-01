import React from 'react';
import { CheckCircle2, XCircle, Tag, AlertCircle } from 'lucide-react';
import type { MissingSkill } from '../types.ts';

interface SkillsSectionProps {
  matchedSkills: string[];
  missingSkills: MissingSkill[];
  atsKeywordGaps: string[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  matchedSkills,
  missingSkills,
  atsKeywordGaps,
}) => {
  // Sort missing skills by importance: high -> medium -> low
  const sortedMissingSkills = [...missingSkills].sort((a, b) => {
    const order: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return (order[b.importance] || 0) - (order[a.importance] || 0);
  });

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-rose-200 text-rose-900 font-bold';
      case 'medium':
        return 'bg-amber-100 text-amber-900 font-medium';
      case 'low':
        return 'bg-slate-200 text-slate-700 font-medium';
      default:
        return 'bg-slate-200 text-slate-700 font-medium';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Matched Skills - Green Chips */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Matched Skills</h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {matchedSkills.length} Verified
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{skill}</span>
              </span>
            ))}
            {matchedSkills.length === 0 && (
              <p className="text-xs text-slate-400 italic">No direct skills matched.</p>
            )}
          </div>
        </div>
      </div>

      {/* Missing Skills - Red Chips sorted by importance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <XCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Missing Skills</h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {missingSkills.length} Criteria
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {sortedMissingSkills.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 text-xs font-medium shadow-xs"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-semibold">{item.skill}</span>
                <span
                  className={`text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded ${getImportanceBadge(
                    item.importance
                  )}`}
                >
                  {item.importance}
                </span>
              </span>
            ))}
            {missingSkills.length === 0 && (
              <p className="text-xs text-emerald-600 font-medium py-2">
                All required skills identified in candidate profile!
              </p>
            )}
          </div>
        </div>

        {/* ATS Keyword Gaps Tag Box */}
        {atsKeywordGaps.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>ATS Keyword Gaps (Mentioned in job, missing in resume)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {atsKeywordGaps.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
