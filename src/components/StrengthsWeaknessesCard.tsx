import React from 'react';
import { ThumbsUp, AlertTriangle, CheckCircle2, XCircle, Quote, ShieldCheck } from 'lucide-react';
import type { StrengthItem, WeaknessItem, MatchedSkillItem, MissingSkillItem } from '../types.ts';

interface StrengthsWeaknessesCardProps {
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  matchedSkills: MatchedSkillItem[];
  missingSkills: MissingSkillItem[];
}

export const StrengthsWeaknessesCard: React.FC<StrengthsWeaknessesCardProps> = ({
  strengths,
  weaknesses,
  matchedSkills,
  missingSkills,
}) => {
  return (
    <div className="space-y-6">
      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Key Verified Strengths</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {strengths.length} verified quotes
            </span>
          </div>

          <div className="space-y-3">
            {strengths.map((item) => (
              <div key={item.id} className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5">
                <div className="font-semibold text-emerald-950 text-sm mb-1">{item.title}</div>
                <p className="text-xs text-slate-700 mb-2 leading-relaxed">{item.text}</p>
                <div className="bg-white p-2 rounded-lg border border-emerald-200/70 text-[11px] font-mono text-slate-700 flex items-start gap-1.5">
                  <Quote className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="italic">"{item.quote}"</span>
                </div>
                <div className="mt-1 text-[10px] text-emerald-800 font-medium flex items-center justify-between">
                  <span>Source: {item.quoteSource === 'resume' ? 'Candidate Resume' : 'Job Description'}</span>
                  <span>✓ Verified in text</span>
                </div>
              </div>
            ))}
            {strengths.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">No verified strengths found.</p>
            )}
          </div>
        </div>

        {/* Growth Areas / Weaknesses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Growth Areas & Gaps</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {weaknesses.length} verified quotes
            </span>
          </div>

          <div className="space-y-3">
            {weaknesses.map((item) => (
              <div key={item.id} className="bg-amber-50/40 border border-amber-100 rounded-xl p-3.5">
                <div className="font-semibold text-amber-950 text-sm mb-1">{item.title}</div>
                <p className="text-xs text-slate-700 mb-2 leading-relaxed">{item.text}</p>
                <div className="bg-white p-2 rounded-lg border border-amber-200/70 text-[11px] font-mono text-slate-700 flex items-start gap-1.5">
                  <Quote className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                  <span className="italic">"{item.quote}"</span>
                </div>
                <div className="mt-1 text-[10px] text-amber-800 font-medium flex items-center justify-between">
                  <span>Source: {item.quoteSource === 'resume' ? 'Candidate Resume' : 'Job Description'}</span>
                  <span>✓ Verified in text</span>
                </div>
              </div>
            ))}
            {weaknesses.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">No gaps identified.</p>
            )}
          </div>
        </div>
      </div>

      {/* Matched vs Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Verified Matched Skills</h3>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {matchedSkills.length} matches
            </span>
          </div>

          <div className="space-y-2.5">
            {matchedSkills.map((ms) => (
              <div key={ms.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="font-semibold text-slate-900 mb-1">{ms.skill}</div>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 font-mono shrink-0">Resume:</span>
                    <span className="italic text-emerald-800">"{ms.resumeQuote}"</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 font-mono shrink-0">Job:</span>
                    <span className="italic text-slate-700">"{ms.jobQuote}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-slate-900 text-sm">Unmatched Job Criteria</h3>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {missingSkills.length} criteria
            </span>
          </div>

          <div className="space-y-2.5">
            {missingSkills.map((ms) => (
              <div key={ms.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900">{ms.skill}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    ms.importance === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {ms.importance === 'high' ? 'High' : 'Low / Plus'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-start gap-1">
                  <span className="text-slate-400 font-mono shrink-0">Job Req:</span>
                  <span className="italic text-slate-700">"{ms.jobQuote}"</span>
                </div>
              </div>
            ))}
            {missingSkills.length === 0 && (
              <p className="text-xs text-emerald-600 font-medium py-3 text-center">
                All specified skills satisfied with verbatim candidate quotes!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
