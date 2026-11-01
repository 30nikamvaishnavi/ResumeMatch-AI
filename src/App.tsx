/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  RotateCcw,
  AlertTriangle,
  FileText,
  Briefcase,
  History as HistoryIcon,
  HelpCircle,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Layers,
  BarChart2,
  BookmarkCheck,
  Printer,
} from 'lucide-react';
import { SAMPLES, type SampleData } from './data/samples.ts';
import type { AnalysisResponseData, KeywordCheckResult, HistoryItem } from './types.ts';
import { HonestEngineBadge } from './components/HonestEngineBadge.tsx';
import { ExternalLinkNotice } from './components/ExternalLinkNotice.tsx';
import { ScoreGauge } from './components/ScoreGauge.tsx';
import { ScoreBreakdownBarChart } from './components/ScoreBreakdownBarChart.tsx';
import { SkillsSection } from './components/SkillsSection.tsx';
import { RewriteSuggestionsCard } from './components/RewriteSuggestionsCard.tsx';
import { StrengthsWeaknessesList } from './components/StrengthsWeaknessesList.tsx';
import { ResumeUploadBox } from './components/ResumeUploadBox.tsx';
import { MultiJobComparisonView } from './components/MultiJobComparisonView.tsx';
import { ReliabilityTestModal } from './components/ReliabilityTestModal.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { AboutModal } from './components/AboutModal.tsx';
import { KeywordCheckModal } from './components/KeywordCheckModal.tsx';
import { ValidationView } from './components/ValidationView.tsx';
import { generateMarkdownReport, exportReportToPDF } from './utils/exportUtils.ts';

const STORAGE_KEY = 'resumematch_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'multijob' | 'validation'>('analyzer');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('junior-bi-analyst');
  
  // Inputs
  const [roleTitle, setRoleTitle] = useState<string>('Junior Business Intelligence Analyst');
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<{
    message: string;
    status?: number;
    details?: string;
  } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponseData | null>(null);

  // Keyword Check State (Rule-based, not AI)
  const [isKeywordChecking, setIsKeywordChecking] = useState<boolean>(false);
  const [keywordResult, setKeywordResult] = useState<KeywordCheckResult | null>(null);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState<boolean>(false);

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isReliabilityOpen, setIsReliabilityOpen] = useState<boolean>(false);
  const [isCopiedMarkdown, setIsCopiedMarkdown] = useState<boolean>(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: AnalysisResponseData) => {
    try {
      const newHistoryItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        date: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        roleTitle: roleTitle || item.roleTitle || 'Target Role Analysis',
        score: item.overall_match_score,
        verdict: item.verdict,
        resumeSnippet: resumeText.slice(0, 120),
        jobSnippet: jobDescriptionText.slice(0, 120),
        analysis: item,
      };

      const updated = [newHistoryItem, ...history.filter((h) => h.id !== newHistoryItem.id)].slice(0, 20);
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setRoleTitle(item.roleTitle);
    setAnalysisResult(item.analysis);
    setActiveTab('analyzer');
  };

  // Load initial sample
  useEffect(() => {
    const initialSample = SAMPLES.find((s) => s.id === 'junior-bi-analyst') || SAMPLES[0];
    if (initialSample) {
      setResumeText(initialSample.resume);
      setJobDescriptionText(initialSample.jobDescription);
      setRoleTitle(initialSample.role);
    }
  }, []);

  const handleSelectSample = (sample: SampleData) => {
    setSelectedSampleId(sample.id);
    setResumeText(sample.resume);
    setJobDescriptionText(sample.jobDescription);
    setRoleTitle(sample.role);
    setAnalysisError(null);
    setAnalysisResult(null);
  };

  // Trigger Gemini Analysis
  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescriptionText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText,
          roleTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.error || `Server responded with ${response.status}`,
          details: errorData.details || 'Every Gemini attempt failed. Exponential backoff and model fallbacks were exhausted.',
        };
      }

      const data: AnalysisResponseData = await response.json();
      setAnalysisResult(data);
      saveToHistory(data);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setAnalysisError({
        message: err.message || 'Gemini analysis failed.',
        status: err.status || 500,
        details: err.details || 'Model request failed after retries. The app did not silently switch to a rule-based engine.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger Quick Keyword Check (Rule-based, not AI)
  const handleQuickKeywordCheck = async () => {
    if (!resumeText.trim() || !jobDescriptionText.trim()) return;

    setIsKeywordChecking(true);
    setIsKeywordModalOpen(true);

    try {
      const response = await fetch('/api/keyword-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText,
        }),
      });

      const data = await response.json();
      setKeywordResult(data);
    } catch (err) {
      console.error('Keyword check error:', err);
    } finally {
      setIsKeywordChecking(false);
    }
  };

  // Copy report as Markdown
  const handleCopyMarkdown = () => {
    if (!analysisResult) return;
    const md = generateMarkdownReport(analysisResult);
    navigator.clipboard.writeText(md);
    setIsCopiedMarkdown(true);
    setTimeout(() => setIsCopiedMarkdown(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">ResumeMatch AI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Gemini API
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Explainable Match Scoring • Embedding Similarity • Zero Fabrication
              </p>
            </div>
          </div>

          {/* Right Action Icons & Tabs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tab Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setActiveTab('analyzer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'analyzer'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Analyzer
              </button>
              <button
                onClick={() => setActiveTab('multijob')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'multijob'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compare</span> Jobs
              </button>
              <button
                onClick={() => setActiveTab('validation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'validation'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Reliability</span>
              </button>
            </div>

            {/* History Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors relative cursor-pointer"
              title="View Analysis History"
            >
              <HistoryIcon className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </button>

            {/* About Button */}
            <button
              onClick={() => setIsAboutOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="About Scoring Rubric"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {activeTab === 'multijob' ? (
          <MultiJobComparisonView
            resumeText={resumeText}
            onSelectReport={(report) => {
              setAnalysisResult(report);
              setActiveTab('analyzer');
            }}
          />
        ) : activeTab === 'validation' ? (
          <ValidationView />
        ) : (
          <div className="space-y-8">
            {/* Sample Resumes Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm print:hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Quick Sample Profiles:
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Sample data
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                        selectedSampleId === sample.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {sample.name}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedSampleId('custom');
                      setResumeText('');
                      setJobDescriptionText('');
                      setRoleTitle('');
                      setAnalysisResult(null);
                      setAnalysisError(null);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                      selectedSampleId === 'custom'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Clear / Blank
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs Section */}
            <div className="space-y-4 print:hidden">
              {/* Optional Target Role Input */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Target Role Title (Optional)
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer, Junior BI Analyst, Operations Specialist"
                  className="w-full text-xs font-semibold text-slate-900 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                />
              </div>

              {/* Two Column Input Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resume Upload / Text Box */}
                <ResumeUploadBox
                  resumeText={resumeText}
                  onChange={setResumeText}
                  onClearSample={() => {
                    if (selectedSampleId !== 'custom') setSelectedSampleId('custom');
                  }}
                />

                {/* Job Description Box */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">Target Job Description</h3>
                      </div>
                      <span className="text-xs text-slate-400">
                        {jobDescriptionText.length.toLocaleString()} chars
                      </span>
                    </div>

                    <textarea
                      value={jobDescriptionText}
                      onChange={(e) => {
                        setJobDescriptionText(e.target.value);
                        if (selectedSampleId !== 'custom') setSelectedSampleId('custom');
                      }}
                      placeholder="Paste target job description with Requirements, Qualifications, and Preferred Skills..."
                      className="w-full min-h-[280px] p-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all leading-relaxed resize-y"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm print:hidden">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Evaluated with <strong>gemini-3.8-flash</strong> & <strong>gemini-embedding-2-preview</strong>.
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Secondary Button: Quick keyword check (no AI) */}
                <button
                  onClick={handleQuickKeywordCheck}
                  disabled={isAnalyzing || isKeywordChecking || !resumeText || !jobDescriptionText}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  <span>Quick keyword check (no AI)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    Rule-based
                  </span>
                </button>

                {/* Primary Button: Analyze with Gemini AI */}
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !resumeText || !jobDescriptionText}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze with Gemini AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error State with Retry Button */}
            {analysisError && (
              <div className="bg-rose-50 border border-rose-300 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-rose-950 text-base">Gemini API Request Failed</h3>
                      {analysisError.status && (
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-rose-200 text-rose-900 rounded">
                          HTTP {analysisError.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-rose-800 leading-relaxed font-mono">
                      {analysisError.message}
                    </p>
                    {analysisError.details && (
                      <p className="mt-2 text-xs text-rose-700 leading-relaxed">
                        <strong>Engine Honesty:</strong> {analysisError.details}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={handleAnalyze}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retry Analysis</span>
                      </button>
                      <span className="text-xs text-rose-600">
                        The application refused to silently fall back to fabricated output.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Report Section */}
            {analysisResult && (
              <div className="space-y-6 animate-in fade-in duration-300 print:space-y-4">
                {/* Report Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-sm text-slate-900">
                      Analysis Report {roleTitle ? `— ${roleTitle}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Consistency Check Button */}
                    <button
                      onClick={() => setIsReliabilityOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                      title="Run 3x Consistency Check"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reliability Test (3x)</span>
                    </button>

                    {/* Copy Markdown */}
                    <button
                      onClick={handleCopyMarkdown}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                    >
                      {isCopiedMarkdown ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Markdown</span>
                        </>
                      )}
                    </button>

                    {/* Download PDF / Print */}
                    <button
                      onClick={exportReportToPDF}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Export / Print PDF</span>
                    </button>
                  </div>
                </div>

                {/* 1. Honest Engine Header */}
                <HonestEngineBadge
                  modelUsed={analysisResult.modelUsed}
                  timestamp={analysisResult.timestamp}
                  latencyMs={analysisResult.latencyMs}
                  attemptsCount={analysisResult.attemptsCount}
                  isFallback={analysisResult.isFallback}
                />

                {/* 2. External Links Notice (if resume contains URL) */}
                <ExternalLinkNotice detectedUrls={analysisResult.externalLinks || []} />

                {/* 3. Overall Match Score Gauge & Semantic Similarity Embedding */}
                <ScoreGauge
                  score={analysisResult.overall_match_score}
                  verdict={analysisResult.verdict}
                  semanticSimilarity={analysisResult.semantic_similarity}
                />

                {/* 4. Score Breakdown Bar Chart */}
                <ScoreBreakdownBarChart breakdown={analysisResult.score_breakdown} />

                {/* 5. Matched Skills, Missing Skills (Sorted), ATS Keyword Gaps */}
                <SkillsSection
                  matchedSkills={analysisResult.matched_skills}
                  missingSkills={analysisResult.missing_skills}
                  atsKeywordGaps={analysisResult.ats_keyword_gaps}
                />

                {/* 6. Strengths (3 items) & Weaknesses (3 items) */}
                <StrengthsWeaknessesList
                  strengths={analysisResult.strengths}
                  weaknesses={analysisResult.weaknesses}
                />

                {/* 7. Bullet Rewrite Suggestions (Before/After with Copy button) */}
                <RewriteSuggestionsCard suggestions={analysisResult.rewrite_suggestions} />

                {/* UI Disclaimer Required by Specification */}
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950">Important Notice:</span> This is an AI estimate and not how every recruiter or ATS will score you. Hiring criteria may involve subjective cultural fit, portfolio demonstrations, and recruiter calibration.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Quick Keyword Check Modal (Rule-based, not AI) */}
      <KeywordCheckModal
        isOpen={isKeywordModalOpen}
        onClose={() => setIsKeywordModalOpen(false)}
        result={keywordResult}
        isLoading={isKeywordChecking}
      />

      {/* Reliability Test Modal (Consistency check 3x) */}
      <ReliabilityTestModal
        isOpen={isReliabilityOpen}
        onClose={() => setIsReliabilityOpen(false)}
        resumeText={resumeText}
        jobDescriptionText={jobDescriptionText}
        roleTitle={roleTitle}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearHistory}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ResumeMatch AI • Live Gemini API Engine & Embedding Integration</span>
          <span className="text-slate-400">Strict Verbatim Evidence & Fact Preservation Pipeline</span>
        </div>
      </footer>
    </div>
  );
}
