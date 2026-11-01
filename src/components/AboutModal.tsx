import React from 'react';
import { X, HelpCircle, Sparkles, Binary, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">About ResumeMatch AI & Scoring Rubric</h3>
              <p className="text-xs text-slate-500">
                How LLM multi-dimensional scoring and Gemini vector embeddings work together
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          {/* Section 1: Overview */}
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-indigo-950">
            <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Two Complementary Evaluation Methodologies</span>
            </h4>
            <p>
              ResumeMatch AI provides two independent methodologies so you never have to blindly trust a single black-box score:
              <strong> LLM Structured Reasoning</strong> and <strong>Gemini Vector Embedding Similarity</strong>.
            </p>
          </div>

          {/* Section 2: LLM Scoring Rubric */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">1. The LLM Multi-Dimensional Rubric</h4>
            <p className="mb-3">
              When Gemini evaluates your resume, it analyzes four core qualification categories using a strict rubric:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 font-sans">Skills Match (0-100%):</span>
                <p className="font-sans text-[11px] text-slate-600 mt-1">
                  Evaluates whether required technical tools, libraries, and core methodologies are demonstrated in your text.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 font-sans">Experience Match (0-100%):</span>
                <p className="font-sans text-[11px] text-slate-600 mt-1">
                  Assesses seniority, project scope, practical application of responsibilities, and team collaboration.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 font-sans">Education Match (0-100%):</span>
                <p className="font-sans text-[11px] text-slate-600 mt-1">
                  Compares relevant degrees, quantitative coursework, bootcamps, and academic certifications.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 font-sans">Keywords & ATS Match (0-100%):</span>
                <p className="font-sans text-[11px] text-slate-600 mt-1">
                  Checks for domain vocabulary and terms that traditional keyword-based ATS search filters prioritize.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Vector Embeddings */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-indigo-600" />
              <span>2. Gemini Vector Embedding Similarity</span>
            </h4>
            <p>
              We run <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-800 font-mono">gemini-embedding-2-preview</code> to convert your resume text and the job description into high-dimensional geometric vectors (3,072 dimensions).
              The cosine angle between these vectors measures pure mathematical topic similarity:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
              <li><strong>Overall Similarity:</strong> Complete document-level conceptual alignment.</li>
              <li><strong>Skills Section Vector:</strong> How closely your skills vocabulary overlaps with requirements.</li>
              <li><strong>Experience Section Vector:</strong> How well your historical responsibilities map to the target role.</li>
            </ul>
          </div>

          {/* Section 4: Strict Honesty Rules */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">3. Engine Honesty & Fact Preservation</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Hallucinations:</strong> Improved bullets preserve only facts from the original bullet. Placeholders like <code className="bg-white px-1 border rounded">[X%]</code> are used for numbers you must measure.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Verifiable Evidence:</strong> Quotes are checked in code against your source text before displaying.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Silent Fallbacks:</strong> If Gemini is unavailable, a clear error and Retry button are shown rather than fabricated output.</span>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Important Disclaimer:</strong> This is an AI estimate and not how every recruiter or ATS will score you. Hiring decisions involve human judgment, portfolio evaluation, interview dynamics, and internal headcount priorities.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
