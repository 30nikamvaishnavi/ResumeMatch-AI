import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Play,
  Award,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { MultiJobItem, AnalysisResponseData } from '../types.ts';

interface MultiJobComparisonViewProps {
  resumeText: string;
  onSelectReport: (analysis: AnalysisResponseData) => void;
}

export const MultiJobComparisonView: React.FC<MultiJobComparisonViewProps> = ({
  resumeText,
  onSelectReport,
}) => {
  const [jobs, setJobs] = useState<MultiJobItem[]>([
    {
      id: 'job-1',
      title: 'Junior Business Intelligence Analyst',
      company: 'Nexus Logistics Global',
      description: `Role: Junior Business Intelligence Analyst
Company: Nexus Logistics Global
Requirements:
- Bachelor's degree in Business, Analytics, Computer Science, or quantitative field
- SQL querying proficiency (SELECT, complex JOINs, aggregations)
- Hands-on experience building interactive dashboards using Tableau or Power BI
- Effective stakeholder communication and KPI presentation skills
Preferred Qualifications:
- Exposure to data warehousing concepts or ETL workflows (plus)
- Python for basic data wrangling with pandas (good to have)`,
      status: 'pending',
    },
    {
      id: 'job-2',
      title: 'Data Analyst — Operations',
      company: 'Apex Supply Chain',
      description: `Role: Data Analyst — Operations
Company: Apex Supply Chain
Requirements:
- Strong SQL proficiency for extracting inventory and shipment data
- Experience creating operational reports in Excel and Tableau
- Ability to coordinate with cross-functional warehouse managers
Preferred:
- Python scripting for automated report scheduling
- Familiarity with logistics metrics (OTIF, dwell time)`,
      status: 'pending',
    },
    {
      id: 'job-3',
      title: 'Analytics Engineer',
      company: 'CloudMetrics Inc',
      description: `Role: Analytics Engineer
Company: CloudMetrics Inc
Requirements:
- 2+ years of experience with dbt, Snowflake, and BigQuery
- Advanced SQL and dimensional data modeling (Kimball)
- Experience writing production Python ETL pipelines
Preferred:
- Airflow orchestration and Docker experience`,
      status: 'pending',
    },
  ]);

  const [isBatchRunning, setIsBatchRunning] = useState(false);

  const handleAddJob = () => {
    if (jobs.length >= 5) return;
    const newJob: MultiJobItem = {
      id: `job-${Date.now()}`,
      title: `Job Description #${jobs.length + 1}`,
      company: '',
      description: '',
      status: 'pending',
    };
    setJobs([...jobs, newJob]);
  };

  const handleRemoveJob = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const handleUpdateJob = (id: string, updates: Partial<MultiJobItem>) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  };

  const runAllComparisons = async () => {
    if (!resumeText.trim()) return;

    setIsBatchRunning(true);

    for (const job of jobs) {
      if (!job.description.trim()) continue;

      handleUpdateJob(job.id, { status: 'analyzing', error: undefined });

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText,
            jobDescriptionText: job.description,
            roleTitle: job.title,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed with status ${res.status}`);
        }

        const data: AnalysisResponseData = await res.json();

        handleUpdateJob(job.id, {
          status: 'completed',
          score: data.overall_match_score,
          verdict: data.verdict,
          analysis: data,
        });
      } catch (e: any) {
        handleUpdateJob(job.id, {
          status: 'error',
          error: e.message || 'Analysis failed.',
        });
      }
    }

    setIsBatchRunning(false);
  };

  // Sort jobs by match score descending (completed first)
  const sortedJobs = [...jobs].sort((a, b) => {
    if (a.score !== undefined && b.score !== undefined) {
      return b.score - a.score;
    }
    if (a.score !== undefined) return -1;
    if (b.score !== undefined) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Multi-Job Match & Ranking Table</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Compare your resume against up to 5 target job descriptions simultaneously to see which role fits best.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddJob}
              disabled={jobs.length >= 5 || isBatchRunning}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Job ({jobs.length}/5)</span>
            </button>

            <button
              onClick={runAllComparisons}
              disabled={isBatchRunning || !resumeText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isBatchRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Jobs...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Rank All Jobs</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Leaderboard Table */}
      {sortedJobs.some((j) => j.status === 'completed') && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Ranked Fit Leaderboard</span>
            </div>
            <span className="text-xs text-slate-500">Sorted by highest match score</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-3 text-center">Match Score</th>
                  <th className="py-3 px-3">Verdict</th>
                  <th className="py-3 px-4">Key Overlap</th>
                  <th className="py-3 px-3 text-center">Semantic Sim</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      index === 0 && job.score ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-center">
                      {job.score ? (
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-extrabold text-xs ${
                            index === 0
                              ? 'bg-amber-400 text-slate-900 shadow-xs'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                      {job.company && (
                        <div className="text-slate-500 text-[11px]">{job.company}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {job.score !== undefined ? (
                        <span className="text-base font-extrabold text-indigo-700 font-mono">
                          {job.score}%
                        </span>
                      ) : job.status === 'analyzing' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600 mx-auto" />
                      ) : (
                        <span className="text-slate-400 italic">Not evaluated</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {job.verdict ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {job.verdict}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {job.analysis ? (
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {job.analysis.matched_skills.length} matched
                          </span>
                          <span className="text-rose-700 font-medium flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            {job.analysis.missing_skills.length} missing
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                      {job.analysis?.semantic_similarity ? (
                        `${job.analysis.semantic_similarity.overall_similarity}%`
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {job.analysis && (
                        <button
                          onClick={() => onSelectReport(job.analysis!)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>View Report</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Job Description Edit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((job, idx) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Role #{idx + 1}
                </span>
                {jobs.length > 1 && (
                  <button
                    onClick={() => handleRemoveJob(job.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    title="Remove Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  value={job.title}
                  onChange={(e) => handleUpdateJob(job.id, { title: e.target.value })}
                  placeholder="Target Role Title (e.g. Data Analyst)"
                  className="w-full text-xs font-semibold text-slate-900 p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={job.company || ''}
                  onChange={(e) => handleUpdateJob(job.id, { company: e.target.value })}
                  placeholder="Company name (optional)"
                  className="w-full text-xs text-slate-700 p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <textarea
                value={job.description}
                onChange={(e) => handleUpdateJob(job.id, { description: e.target.value })}
                placeholder="Paste Job Description requirements and preferred qualifications..."
                className="w-full h-36 p-2.5 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {job.status === 'analyzing' && (
                <span className="text-indigo-600 font-medium flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing with Gemini...
                </span>
              )}
              {job.status === 'completed' && (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Score: {job.score}% ({job.verdict})
                </span>
              )}
              {job.status === 'error' && (
                <span className="text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Failed
                </span>
              )}
              {job.status === 'pending' && (
                <span className="text-slate-400">Ready to rank</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
