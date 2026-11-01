import React from 'react';
import { ThumbsUp, AlertTriangle } from 'lucide-react';

interface StrengthsWeaknessesListProps {
  strengths: string[];
  weaknesses: string[];
}

export const StrengthsWeaknessesList: React.FC<StrengthsWeaknessesListProps> = ({
  strengths,
  weaknesses,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strengths */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Key Candidate Strengths</h3>
        </div>

        <div className="space-y-3">
          {strengths.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-slate-800 leading-relaxed flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="font-medium text-emerald-950">{item}</p>
            </div>
          ))}
          {strengths.length === 0 && (
            <p className="text-xs text-slate-400 italic">No specific strengths returned.</p>
          )}
        </div>
      </div>

      {/* Weaknesses / Gaps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Gaps & Development Areas</h3>
        </div>

        <div className="space-y-3">
          {weaknesses.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-slate-800 leading-relaxed flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="font-medium text-amber-950">{item}</p>
            </div>
          ))}
          {weaknesses.length === 0 && (
            <p className="text-xs text-slate-400 italic">No weaknesses detected.</p>
          )}
        </div>
      </div>
    </div>
  );
};
