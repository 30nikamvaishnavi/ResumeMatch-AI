export type ImportanceLevel = 'high' | 'medium' | 'low';
export type MatchVerdict = 'Strong match' | 'Good match' | 'Partial match' | 'Weak match';
export type MatchStatus = 'matched' | 'partial' | 'missing';

export interface ScoreCategory {
  score: number;
  reason: string;
}

export interface ScoreBreakdown {
  skills_match: ScoreCategory;
  experience_match: ScoreCategory;
  education_match: ScoreCategory;
  keywords_match: ScoreCategory;
}

export interface MissingSkill {
  skill: string;
  importance: ImportanceLevel;
}

export interface RewriteSuggestion {
  original: string;
  improved: string;
  critique?: string;
}

export interface SemanticSimilarityEmbeddings {
  overall_similarity: number; // 0-100
  skills_similarity: number; // 0-100
  experience_similarity: number; // 0-100
  baseline_noise?: number; // 0-100
  relative_lift?: number; // 0-100
  method: 'gemini-embedding-2-preview' | 'vector-token-cosine';
}

export interface AnalysisResponseData {
  overall_match_score: number;
  score_breakdown: ScoreBreakdown;
  matched_skills: string[];
  missing_skills: MissingSkill[];
  ats_keyword_gaps: string[];
  strengths: string[];
  weaknesses: string[];
  rewrite_suggestions: RewriteSuggestion[];
  verdict: MatchVerdict;
  
  // Engine metadata
  modelUsed: string;
  timestamp: string;
  latencyMs: number;
  attemptsCount: number;
  isFallback: boolean;
  roleTitle?: string;
  
  // Semantic similarity from embedding model
  semantic_similarity: SemanticSimilarityEmbeddings;
  
  // Detected external links notice
  externalLinks?: string[];
  externalLinkNotice?: string;
}

export interface KeywordCheckResult {
  isRuleBased: true;
  label: string;
  keywordOverlapScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
  scanTimeMs: number;
}

export interface HistoryItem {
  id: string;
  date: string;
  roleTitle: string;
  score: number;
  verdict: MatchVerdict;
  resumeSnippet: string;
  jobSnippet: string;
  analysis: AnalysisResponseData;
}

export interface MultiJobItem {
  id: string;
  title: string;
  company?: string;
  description: string;
  score?: number;
  verdict?: MatchVerdict;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  analysis?: AnalysisResponseData;
  error?: string;
}

export interface ReliabilityRun {
  runNumber: number;
  score: number;
  verdict: MatchVerdict;
  latencyMs: number;
  timestamp: string;
}

export interface ReliabilityTestResult {
  roleTitle: string;
  runs: ReliabilityRun[];
  averageScore: number;
  spread: number;
  isConsistent: boolean;
  warning?: string;
}

// Types for detailed evidence verification
export interface RequirementMatch {
  id: string;
  requirement: string;
  status: MatchStatus;
  importance: ImportanceLevel;
  evidenceQuote: string;
  quoteSource: 'resume' | 'job_description';
  semanticExplanation: string;
  verified: boolean;
}

export interface StrengthItem {
  id: string;
  title: string;
  text: string;
  quote: string;
  quoteSource: 'resume' | 'job_description';
  verified: boolean;
}

export interface WeaknessItem {
  id: string;
  title: string;
  text: string;
  quote: string;
  quoteSource: 'resume' | 'job_description';
  verified: boolean;
}

export interface MatchedSkillItem {
  id: string;
  skill: string;
  resumeQuote: string;
  jobQuote: string;
  verified: boolean;
}

export interface MissingSkillItem {
  id: string;
  skill: string;
  jobQuote: string;
  importance: ImportanceLevel;
  verified: boolean;
}

export interface BulletRewriteItem {
  id: string;
  original: string;
  section: string;
  critique: string;
  rewrite: string;
  verifiedNoFabricatedTools: boolean;
}

export interface UnrelatedTextComparison {
  title: string;
  domain: string;
  similarity: number;
}

export interface SemanticSimilarityResult {
  overallScore: number;
  baselineScore: number;
  relativeLift: number;
  unrelatedTexts: UnrelatedTextComparison[];
}

export interface AnalysisStats {
  matchedCount: number;
  partialCount: number;
  missingCount: number;
  totalRequirements: number;
  highPriorityMissingCount: number;
}

export interface AnalysisResult {
  modelUsed: string;
  timestamp: string;
  latencyMs: number;
  attemptsCount: number;
  isFallback: boolean;
  overallScore: number;
  scoreReasons: string[];
  requirements: RequirementMatch[];
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  matchedSkills: MatchedSkillItem[];
  missingSkills: MissingSkillItem[];
  rewrites: BulletRewriteItem[];
  rewritesNotice?: string;
  semanticSimilarity: SemanticSimilarityResult;
  externalLinkDetected: boolean;
  externalLinks: string[];
  externalLinkNotice?: string;
  stats: AnalysisStats;
}

export interface ValidationTestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running';
  details: string;
  modelUsed?: string;
  assertions: {
    name: string;
    passed: boolean;
    evidence: string;
  }[];
  timestamp: string;
}
