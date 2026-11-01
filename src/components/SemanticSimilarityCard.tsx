import React, { useState } from 'react';
import { Target, Compass, TrendingUp, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import type { SemanticSimilarityResult } from '../types.ts';

interface SemanticSimilarityCardProps {
  similarity: SemanticSimilarityResult;
}

export const SemanticSimilarityCard: React.FC<SemanticSimilarityCardProps> = ({ similarity }) => {
  const [showBaselineDetails, setShowBaselineDetails] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Semantic Similarity & Unrelated Baseline</h3>
            <p className="text-xs text-slate-500">
              Benchmarked against 3 orthogonal domain texts to eliminate language noise
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowBaselineDetails(!showBaselineDetails)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{showBaselineDetails ? 'Hide Benchmark Texts' : 'View Baseline Texts'}</span>
          {showBaselineDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Metric 1: Overall Similarity */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Target Similarity</span>
            <Target className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{similarity.overallScore}%</span>
            <span className="text-xs text-slate-500">Resume ↔ Job Description</span>
          </div>
          <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, similarity.overallScore)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Baseline Unrelated Similarity */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Unrelated Baseline</span>
            <Compass className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-600">{similarity.baselineScore}%</span>
            <span className="text-xs text-slate-500">Noise floor (3 domains)</span>
          </div>
          <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-slate-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, similarity.baselineScore)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Relative Score Lift */}
        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
            <span className="font-semibold">Relative Semantic Lift</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">+{similarity.relativeLift}%</span>
            <span className="text-xs text-emerald-600 font-medium">Above random baseline</span>
          </div>
          <div className="mt-3 text-xs text-emerald-800 font-medium">
            Signal-to-noise ratio: <strong className="font-bold">{(similarity.overallScore / Math.max(1, similarity.baselineScore)).toFixed(1)}x</strong> above noise
          </div>
        </div>
      </div>

      {showBaselineDetails && (
        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 rounded-xl p-4 text-xs text-slate-600 space-y-3">
          <div className="font-semibold text-slate-800">
            Baseline Reference Texts (Job Description compared against 3 unrelated non-job texts):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {similarity.unrelatedTexts.map((item: any, idx: number) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="font-medium text-slate-800">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.domain}</div>
                </div>
                <div className="mt-2 text-right">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-mono font-semibold text-slate-700 text-xs">
                    {item.similarity}% similarity
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            *Why this matters: Standard text encoders register 8-15% accidental word overlap with any English prose. Measuring against unrelated baselines proves candidate alignment is genuine domain relevance, not generic English syntax.
          </p>
        </div>
      )}
    </div>
  );
};
