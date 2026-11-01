import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Quote, ShieldCheck } from 'lucide-react';
import type { RequirementMatch, MatchStatus, ImportanceLevel } from '../types.ts';

interface RequirementsTableProps {
  requirements: RequirementMatch[];
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({ requirements }) => {
  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case 'matched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Matched
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Partial Evidence
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Missing
          </span>
        );
    }
  };

  const getImportanceBadge = (importance: ImportanceLevel) => {
    switch (importance) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
            Low (Plus / Preferred)
          </span>
        );
    }
  };

  if (!requirements || requirements.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500">
        No requirements evaluated.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Semantic Requirement Breakdown</h3>
          <p className="text-xs text-slate-500">
            Matched semantically with verified verbatim evidence quotes from resume or job text
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Verbatim Quotes Verified
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Requirement</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Priority / Weight</th>
              <th className="py-3 px-4">Verbatim Evidence Quote</th>
              <th className="py-3 px-4">Semantic Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {requirements.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                  {req.requirement}
                </td>
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {getStatusBadge(req.status)}
                </td>
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {getImportanceBadge(req.importance)}
                </td>
                <td className="py-3.5 px-4 max-w-sm">
                  {req.evidenceQuote ? (
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 text-xs text-slate-700">
                      <div className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed">
                        <Quote className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="italic">"{req.evidenceQuote}"</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="uppercase font-semibold tracking-wider text-slate-500">
                          Source: {req.quoteSource === 'resume' ? 'Candidate Resume' : 'Job Description'}
                        </span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          ✓ Verified in text
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No evidence quote</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-600 leading-relaxed max-w-xs">
                  {req.semanticExplanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
