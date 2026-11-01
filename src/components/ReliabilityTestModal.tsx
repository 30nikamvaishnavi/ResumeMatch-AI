import React, { useState } from 'react';
import { X, Play, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import type { ReliabilityRun, ReliabilityTestResult } from '../types.ts';

interface ReliabilityTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeText: string;
  jobDescriptionText: string;
  roleTitle?: string;
}

export const ReliabilityTestModal: React.FC<ReliabilityTestModalProps> = ({
  isOpen,
  onClose,
  resumeText,
  jobDescriptionText,
  roleTitle,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [runs, setRuns] = useState<ReliabilityRun[]>([]);
  const [result, setResult] = useState<ReliabilityTestResult | null>(null);

  if (!isOpen) return null;

  const runTest = async () => {
    setIsRunning(true);
    setRuns([]);
    setResult(null);

    const completedRuns: ReliabilityRun[] = [];

    for (let i = 1; i <= 3; i++) {
      const startTime = Date.now();
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText,
            jobDescriptionText,
            roleTitle,
            temperature: 0.1, // low temperature for consistency test
          }),
        });

        if (!res.ok) {
          throw new Error(`Run ${i} failed`);
        }

        const data = await res.json();
        const runItem: ReliabilityRun = {
          runNumber: i,
          score: data.overall_match_score,
          verdict: data.verdict,
          latencyMs: Date.now() - startTime,
          timestamp: new Date().toLocaleTimeString(),
        };

        completedRuns.push(runItem);
        setRuns([...completedRuns]);
      } catch (err: any) {
        console.error(`Reliability run ${i} error:`, err);
      }
    }

    if (completedRuns.length > 0) {
      const scores = completedRuns.map((r) => r.score);
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const spread = max - min;
      const isConsistent = spread <= 10;

      setResult({
        roleTitle: roleTitle || 'Target Role',
        runs: completedRuns,
        averageScore: avg,
        spread,
        isConsistent,
        warning: !isConsistent
          ? `Warning: Score spread (${spread} points) exceeds 10 points threshold. The candidate experience may have borderline criteria.`
          : undefined,
      });
    }

    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Scoring Reliability Check</h3>
              <p className="text-xs text-slate-500">
                Runs 3 low-temperature analyses to measure score stability and variance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!result && !isRunning && (
            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-800 mb-1">How this works:</p>
              The app evaluates your resume against the current job description 3 consecutive times with low temperature (temperature: 0.1).
              A reliable score should vary by at most 10 points. If variance exceeds 10 points, a clear warning will be displayed.
            </div>
          )}

          {/* Progress / Status */}
          {isRunning && (
            <div className="py-6 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Executing Run #{runs.length + 1} of 3...
              </p>
              <p className="text-xs text-slate-500">
                Calling Gemini API with deterministic sampling parameters
              </p>
            </div>
          )}

          {/* Runs List */}
          {runs.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Individual Evaluation Runs:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {runs.map((r) => (
                  <div
                    key={r.runNumber}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center"
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Run #{r.runNumber}
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                      {r.score}%
                    </div>
                    <div className="text-[11px] text-indigo-700 font-medium mt-0.5">
                      {r.verdict}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary / Result */}
          {result && (
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Average Score
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                    {result.averageScore}%
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Score Spread (Max - Min)
                  </div>
                  <div className="text-3xl font-extrabold text-indigo-700 mt-0.5">
                    {result.spread} pts
                  </div>
                </div>
              </div>

              {result.isConsistent ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Consistent & Reliable Score:</span> Spread is within the allowable 10-point margin (variance: {result.spread} pts).
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">High Variance Detected:</span> Score spread is {result.spread} points (exceeds 10 points threshold). Certain qualifications in your resume may be borderline or ambiguous for this job description.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={runTest}
            disabled={isRunning || !resumeText || !jobDescriptionText}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {result ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{result ? 'Run Again' : 'Start Consistency Test'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
