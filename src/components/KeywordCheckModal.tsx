import React from 'react';
import { X, Search, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import type { KeywordCheckResult } from '../types.ts';

interface KeywordCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: KeywordCheckResult | null;
  isLoading: boolean;
}

export const KeywordCheckModal: React.FC<KeywordCheckModalProps> = ({
  isOpen,
  onClose,
  result,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Quick Keyword Check</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-300">
                  <ShieldAlert className="w-3 h-3" />
                  Rule-based, not AI
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Exact string token occurrence only • No rewrites • No quotes • No semantic context
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">Scanning document text for keyword matches...</p>
            </div>
          ) : result ? (
            <div className="space-y-5">
              {/* Overlap Summary */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Keyword Overlap Score
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                    {result.keywordOverlapScore}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {result.matchedKeywords.length} of {result.totalKeywords} target keywords found ({result.scanTimeMs}ms)
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-400 flex items-center justify-center font-bold text-amber-800 text-lg">
                  {result.keywordOverlapScore}%
                </div>
              </div>

              {/* Matched Keywords */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Found in Resume ({result.matchedKeywords.length}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.length > 0 ? (
                    result.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
                      >
                        ✓ {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No keyword overlaps detected.</span>
                  )}
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Missing Keywords ({result.missingKeywords.length}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.length > 0 ? (
                    result.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium"
                      >
                        ✗ {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-600">All target keywords found.</span>
                  )}
                </div>
              </div>

              {/* Rule-Based Disclaimer */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Honesty Note:</strong> This is a simple dictionary keyword search. It does not measure competency, context, or real-world qualifications. For verifiable semantic analysis with verbatim evidence quotes and bullet rewrites, use <strong>Analyze with Gemini AI</strong>.
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
