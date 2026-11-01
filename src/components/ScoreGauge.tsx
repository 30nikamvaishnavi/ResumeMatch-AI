import React from 'react';
import { Award, Sparkles, Binary, CheckCircle2 } from 'lucide-react';
import type { MatchVerdict, SemanticSimilarityEmbeddings } from '../types.ts';

interface ScoreGaugeProps {
  score: number;
  verdict: MatchVerdict;
  semanticSimilarity?: SemanticSimilarityEmbeddings;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, verdict, semanticSimilarity }) => {
  const getVerdictStyle = (v: MatchVerdict) => {
    switch (v) {
      case 'Strong match':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Good match':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Partial match':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Weak match':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // SVG Gauge calculations (circumference for r=70 is 2 * PI * 70 = 439.82)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * (circumference * 0.75); // 270-degree arc
  const arcLength = circumference * 0.75;

  const getScoreColor = (s: number) => {
    if (s >= 85) return '#10b981'; // emerald-500
    if (s >= 70) return '#6366f1'; // indigo-500
    if (s >= 50) return '#f59e0b'; // amber-500
    return '#f43f5e'; // rose-500
  };

  const semSim = semanticSimilarity?.overall_similarity ?? 75;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: LLM Match Score Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-135" viewBox="0 0 180 180">
              {/* Background Arc */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="14"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={getScoreColor(score)}
                strokeWidth="14"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {score}
                <span className="text-xl text-slate-400 font-semibold">%</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
                Overall Match
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${getVerdictStyle(
                  verdict
                )}`}
              >
                <Award className="w-3.5 h-3.5" />
                {verdict}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Explainable Match Score</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
              Synthesized by Gemini based on skills alignment, experience depth, education credentials, and keywords.
            </p>
          </div>
        </div>

        {/* Right: Semantic Similarity via Embedding Model */}
        {semanticSimilarity && (
          <div className="w-full lg:w-auto bg-slate-50 rounded-2xl p-4 border border-slate-200/90 flex flex-col justify-between min-w-[280px]">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Binary className="w-4 h-4 text-indigo-600" />
                <span>Semantic Similarity</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Gemini Embedding
              </span>
            </div>

            <div className="my-3 flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-extrabold text-indigo-950">{semSim}%</div>
                <div className="text-[11px] text-slate-500">Vector Cosine Metric</div>
              </div>
              <div className="text-right text-xs">
                <span className="font-semibold text-slate-700">
                  {Math.abs(score - semSim) <= 8 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> High Agreement
                    </span>
                  ) : (
                    <span className="text-amber-600">Nuanced Variation</span>
                  )}
                </span>
                <div className="text-[10px] text-slate-400 mt-0.5">LLM vs Embedding</div>
              </div>
            </div>

            {/* Section Breakdown Chips */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Skills Vector</span>
                <span className="font-bold text-slate-800 mt-0.5">
                  {semanticSimilarity.skills_similarity}%
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Experience Vector</span>
                <span className="font-bold text-slate-800 mt-0.5">
                  {semanticSimilarity.experience_similarity}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
