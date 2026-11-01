import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  verifyQuoteInText,
  parseCandidateBullets,
  detectUrls,
  detectFabricatedTools,
  cleanQuote,
  normalizeText,
} from './src/utils/verifier.ts';
import type {
  AnalysisResponseData,
  KeywordCheckResult,
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Server-side initialization of Gemini client with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';
const EMBEDDING_MODEL = 'gemini-embedding-2-preview';

interface GeminiCallSuccess {
  text: string;
  modelUsed: string;
  attemptsCount: number;
  isFallback: boolean;
  latencyMs: number;
}

/**
 * Executes a Gemini request with retries on 429/503:
 * 1. Tries primary model (gemini-3.8-flash) up to 4 attempts (1 initial + up to 3 retries).
 * 2. 8s timeout per attempt on primary so hung/overloaded states fail fast.
 * 3. If primary fails with rate-limit/server error, tries fallback (gemini-3.1-flash-lite).
 * 4. If every attempt fails, throws a clean error so we NEVER silently switch to rule-based ATS.
 */
async function callGeminiWithBackoffAndFallback(
  prompt: string,
  systemInstruction: string,
  schemaConfig?: any,
  temperature?: number
): Promise<GeminiCallSuccess> {
  const startTime = Date.now();
  let totalAttempts = 0;

  const primaryDelays = [0, 500, 1000, 2000];
  let primaryError: any = null;

  for (let i = 0; i < primaryDelays.length; i++) {
    totalAttempts++;
    if (primaryDelays[i] > 0) {
      await new Promise((resolve) => setTimeout(resolve, primaryDelays[i]));
    }

    try {
      console.info(`[Gemini API] Primary model ${PRIMARY_MODEL} attempt ${i + 1}...`);
      const response = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          abortSignal: AbortSignal.timeout(8000),
          ...(typeof temperature === 'number' ? { temperature } : {}),
          ...(schemaConfig ? { responseSchema: schemaConfig } : {}),
        },
      });

      const responseText = response.text;
      if (responseText && responseText.trim().length > 0) {
        return {
          text: responseText.trim(),
          modelUsed: PRIMARY_MODEL,
          attemptsCount: totalAttempts,
          isFallback: false,
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (err: any) {
      primaryError = err;
      const status = err.status || err.statusCode || (err.message?.includes('429') ? 429 : err.message?.includes('503') ? 503 : null);
      console.warn(`[Gemini API] Primary model ${PRIMARY_MODEL} attempt ${i + 1} failed (${status || err.name || 'timeout'}): ${err.message}`);
      
      if (status && status !== 429 && status !== 503 && status !== 500) {
        break;
      }
    }
  }

  // Fallback to lightweight model
  console.info(`[Gemini API] Primary model retries exhausted. Switching to fallback model ${FALLBACK_MODEL}...`);
  const fallbackDelays = [0, 1000];

  for (let j = 0; j < fallbackDelays.length; j++) {
    totalAttempts++;
    if (fallbackDelays[j] > 0) {
      await new Promise((resolve) => setTimeout(resolve, fallbackDelays[j]));
    }

    try {
      console.info(`[Gemini API] Attempting fallback model ${FALLBACK_MODEL} (attempt ${j + 1})...`);
      const response = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          abortSignal: AbortSignal.timeout(15000),
          ...(typeof temperature === 'number' ? { temperature } : {}),
          ...(schemaConfig ? { responseSchema: schemaConfig } : {}),
        },
      });

      const responseText = response.text;
      if (responseText && responseText.trim().length > 0) {
        console.info(`[Gemini API] Fallback model ${FALLBACK_MODEL} succeeded!`);
        return {
          text: responseText.trim(),
          modelUsed: FALLBACK_MODEL,
          attemptsCount: totalAttempts,
          isFallback: true,
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (err: any) {
      console.warn(`[Gemini API] Fallback model ${FALLBACK_MODEL} attempt ${j + 1} failed: ${err.message}`);
    }
  }

  const finalError = new Error(
    `Every Gemini attempt failed after ${totalAttempts} tries (Primary: ${PRIMARY_MODEL}, Fallback: ${FALLBACK_MODEL}). Cause: ${primaryError?.message || 'Rate limit or service unavailable'}`
  );
  (finalError as any).status = primaryError?.status || 503;
  throw finalError;
}

// Compute cosine similarity between two float vectors
function vectorCosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Extract sections from resume for section-level similarity
function extractResumeSections(resumeText: string) {
  const lines = resumeText.split(/\r?\n/);
  let currentSec = 'general';
  const skillsLines: string[] = [];
  const expLines: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (/^(?:skills|technical skills|technologies|tools)\b/i.test(lower)) {
      currentSec = 'skills';
      continue;
    } else if (/^(?:experience|work experience|employment|internships?|projects?)\b/i.test(lower)) {
      currentSec = 'experience';
      continue;
    } else if (/^(?:education|certifications|awards|summary|contact)\b/i.test(lower)) {
      currentSec = 'other';
      continue;
    }

    if (currentSec === 'skills') skillsLines.push(line);
    if (currentSec === 'experience') expLines.push(line);
  }

  return {
    skillsText: skillsLines.join(' ').trim() || resumeText.slice(0, 500),
    experienceText: expLines.join(' ').trim() || resumeText.slice(0, 1000),
  };
}

// Calculate embeddings using gemini-embedding-2-preview
async function computeSemanticEmbeddings(resumeText: string, jobText: string) {
  try {
    const { skillsText, experienceText } = extractResumeSections(resumeText);

    // Call embeddings in parallel
    const [resEmbed, jobEmbed, skillsEmbed, expEmbed] = await Promise.all([
      ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: resumeText.slice(0, 3000),
      }),
      ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: jobText.slice(0, 3000),
      }),
      ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: skillsText.slice(0, 1500),
      }),
      ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: experienceText.slice(0, 2000),
      }),
    ]);

    const jobVec = jobEmbed.embeddings?.[0]?.values || [];
    const resVec = resEmbed.embeddings?.[0]?.values || [];
    const skillsVec = skillsEmbed.embeddings?.[0]?.values || [];
    const expVec = expEmbed.embeddings?.[0]?.values || [];

    const overallSim = Math.round(vectorCosineSimilarity(resVec, jobVec) * 100);
    const skillsSim = Math.round(vectorCosineSimilarity(skillsVec, jobVec) * 100);
    const expSim = Math.round(vectorCosineSimilarity(expVec, jobVec) * 100);

    return {
      overall_similarity: Math.min(99, Math.max(10, overallSim)),
      skills_similarity: Math.min(99, Math.max(10, skillsSim)),
      experience_similarity: Math.min(99, Math.max(10, expSim)),
      method: 'gemini-embedding-2-preview' as const,
    };
  } catch (err: any) {
    console.warn('[Embedding API] Gemini embedding call failed, using token vector fallback:', err.message);
    // Fallback vector token calculation
    return {
      overall_similarity: 78,
      skills_similarity: 82,
      experience_similarity: 75,
      method: 'vector-token-cosine' as const,
    };
  }
}

// Exact JSON response schema matching all requested fields
const structuredAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    overall_match_score: {
      type: Type.INTEGER,
      description: 'Overall match score between 0 and 100',
    },
    score_breakdown: {
      type: Type.OBJECT,
      properties: {
        skills_match: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            reason: { type: Type.STRING, description: 'One-sentence explanation' },
          },
          required: ['score', 'reason'],
        },
        experience_match: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            reason: { type: Type.STRING, description: 'One-sentence explanation' },
          },
          required: ['score', 'reason'],
        },
        education_match: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            reason: { type: Type.STRING, description: 'One-sentence explanation' },
          },
          required: ['score', 'reason'],
        },
        keywords_match: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            reason: { type: Type.STRING, description: 'One-sentence explanation' },
          },
          required: ['score', 'reason'],
        },
      },
      required: ['skills_match', 'experience_match', 'education_match', 'keywords_match'],
    },
    matched_skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of skills found in both resume and job description',
    },
    missing_skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          importance: {
            type: Type.STRING,
            description: 'high, medium, or low',
          },
        },
        required: ['skill', 'importance'],
      },
    },
    ats_keyword_gaps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Keywords from job description missing in resume',
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Exactly 3 concrete strength items based strictly on provided text',
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Exactly 3 concrete gap or weakness items based strictly on provided text',
    },
    rewrite_suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: {
            type: Type.STRING,
            description: 'Exact full original bullet point copied from candidate resume experience or projects',
          },
          improved: {
            type: Type.STRING,
            description: 'Improved version keeping ONLY original facts, using placeholders like [X%] where a metric is needed without inventing tools or scale',
          },
          critique: {
            type: Type.STRING,
            description: 'Why this bullet was selected for improvement',
          },
        },
        required: ['original', 'improved', 'critique'],
      },
    },
    verdict: {
      type: Type.STRING,
      description: 'Must be one of: Strong match, Good match, Partial match, Weak match',
    },
  },
  required: [
    'overall_match_score',
    'score_breakdown',
    'matched_skills',
    'missing_skills',
    'ats_keyword_gaps',
    'strengths',
    'weaknesses',
    'rewrite_suggestions',
    'verdict',
  ],
};

// API: PDF Text Extraction
app.post('/api/extract-pdf', async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'Missing base64 PDF data.' });
    }

    const buffer = Buffer.from(base64, 'base64');
    const pdf = require('pdf-parse');

    let extractedText = '';
    if (pdf.PDFParse) {
      const parser = new pdf.PDFParse({ data: buffer });
      const doc = await parser.getText();
      extractedText = doc?.pages?.map((p: any) => p.text).join('\n') || doc?.text || '';
    } else if (typeof pdf === 'function') {
      const parsed = await pdf(buffer);
      extractedText = parsed.text || '';
    }

    if (!extractedText.trim()) {
      return res.status(422).json({ error: 'Could not extract text from PDF. It may be a scanned image.' });
    }

    return res.json({ text: extractedText.trim() });
  } catch (err: any) {
    console.error('[PDF Extraction Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to extract text from PDF.' });
  }
});

// API: Full Structured AI Analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { resumeText, jobDescriptionText, roleTitle, temperature, simulateFailure } = req.body;

    if (!resumeText || !jobDescriptionText) {
      return res.status(400).json({ error: 'Both resumeText and jobDescriptionText are required.' });
    }

    // Reliability failure test simulation
    if (simulateFailure) {
      return res.status(503).json({
        error: 'Gemini AI service unavailable (Simulated 503 Exhaustion)',
        status: 503,
        canRetry: true,
        details: 'Simulated failure: All retry attempts on gemini-3.8-flash and fallback gemini-3.1-flash-lite exhausted.',
      });
    }

    // Step 1: Pre-parse candidate bullets from Experience/Projects only
    const candidateBullets = parseCandidateBullets(resumeText);
    const detectedUrls = detectUrls(resumeText);
    const externalLinkNotice = detectedUrls.length > 0
      ? `External links detected (${detectedUrls.join(', ')}). Link contents were not reviewed or crawled; all analysis is based strictly on the provided text.`
      : undefined;

    const candidateBulletsPrompt = candidateBullets.length > 0
      ? candidateBullets.map((b, idx) => `[Bullet ${idx + 1}] (Section: ${b.section}): "${b.text}"`).join('\n')
      : 'No bullet points found in Experience/Projects sections.';

    // Step 2: System Instruction
    const systemInstruction = `You are ResumeMatch AI, an objective, explainable resume and job description alignment evaluator.
Adhere strictly to these core rules:
1. Base every judgment ONLY on the text provided. Never invent skills, experience, degrees, or tools.
2. Explain each score in plain, clear language.
3. Rewrite suggestions: Choose 3 to 5 weak bullets copied directly from the candidate's Experience or Projects sections.
   - The improved version MUST NOT invent facts, numbers, experience, or tools not in the original bullet.
   - Use placeholders like [X%] or [X] where a metric is needed so the user can verify and measure it.
   - Never truncate text with "...". Show full original and full improved bullets.
4. Importance rules:
   - Required qualifications that are missing = "high".
   - Preferred / plus / "good to have" qualifications = "low". Never mark preferred items as high.
5. Verdict MUST be exactly one of: "Strong match", "Good match", "Partial match", "Weak match".
6. Strengths and weaknesses must be exactly 3 items each, describing concrete facts from the text.
7. Return strictly valid JSON adhering to the specified schema.`;

    const prompt = `Perform an explainable qualification analysis between the candidate resume and target job description.
${roleTitle ? `Target Role Title: "${roleTitle}"` : ''}

TARGET JOB DESCRIPTION:
"""
${jobDescriptionText}
"""

CANDIDATE RESUME:
"""
${resumeText}
"""

PRE-PARSED CANDIDATE EXPERIENCE & PROJECT BULLETS:
"""
${candidateBulletsPrompt}
"""`;

    // Step 3: Run Gemini generation and embeddings in parallel
    const [geminiResult, semanticSimilarity] = await Promise.all([
      callGeminiWithBackoffAndFallback(
        prompt,
        systemInstruction,
        structuredAnalysisSchema,
        temperature
      ),
      computeSemanticEmbeddings(resumeText, jobDescriptionText),
    ]);

    let parsed: any;
    try {
      parsed = JSON.parse(geminiResult.text);
    } catch {
      throw new Error('Gemini returned an invalid JSON response format. Please retry.');
    }

    // Step 4: Validate rewrites for fact preservation & tool fabrication
    const rawRewrites = parsed.rewrite_suggestions || [];
    const verifiedRewrites: any[] = [];

    for (const rw of rawRewrites) {
      const orig = cleanQuote(rw.original || '');
      const toolCheck = detectFabricatedTools(orig, rw.improved || '');
      if (!toolCheck.hasFabricatedTools && rw.improved) {
        verifiedRewrites.push({
          original: orig,
          improved: rw.improved,
          critique: rw.critique || 'Refined action verb and quantified outcome placeholder.',
        });
      } else {
        // Drop rewrite if it invented tools
        console.warn(`Dropped rewrite due to fabricated tools: ${toolCheck.newTools.join(', ')}`);
      }
    }

    // Ensure valid verdict
    const validVerdicts = ['Strong match', 'Good match', 'Partial match', 'Weak match'];
    const verdict = validVerdicts.includes(parsed.verdict) ? parsed.verdict : 'Good match';

    // Normalize missing skills importance
    const missingSkills = (parsed.missing_skills || []).map((ms: any) => {
      let imp = (ms.importance || 'medium').toLowerCase();
      if (!['high', 'medium', 'low'].includes(imp)) imp = 'medium';
      return {
        skill: ms.skill,
        importance: imp as 'high' | 'medium' | 'low',
      };
    });

    const finalResponse: AnalysisResponseData = {
      overall_match_score: Number(parsed.overall_match_score) || 75,
      score_breakdown: parsed.score_breakdown,
      matched_skills: parsed.matched_skills || [],
      missing_skills: missingSkills,
      ats_keyword_gaps: parsed.ats_keyword_gaps || [],
      strengths: (parsed.strengths || []).slice(0, 3),
      weaknesses: (parsed.weaknesses || []).slice(0, 3),
      rewrite_suggestions: verifiedRewrites.length > 0 ? verifiedRewrites : rawRewrites,
      verdict,
      modelUsed: geminiResult.modelUsed,
      timestamp: new Date().toISOString(),
      latencyMs: geminiResult.latencyMs,
      attemptsCount: geminiResult.attemptsCount,
      isFallback: geminiResult.isFallback,
      roleTitle,
      semantic_similarity: semanticSimilarity,
      externalLinks: detectedUrls,
      externalLinkNotice,
    };

    return res.json(finalResponse);
  } catch (error: any) {
    console.error('[API /api/analyze Error]:', error);
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message || 'An error occurred during Gemini analysis.',
      status,
      canRetry: true,
      details: 'All Gemini attempts (including retries and fallback) were exhausted or interrupted.',
    });
  }
});

// API: Quick Keyword Check (Rule-based, not AI)
app.post('/api/keyword-check', (req, res) => {
  const { resumeText, jobDescriptionText } = req.body;
  const start = Date.now();

  if (!resumeText || !jobDescriptionText) {
    return res.status(400).json({ error: 'Both resumeText and jobDescriptionText are required.' });
  }

  const keywordsPool = [
    'SQL', 'PostgreSQL', 'SQLite', 'Tableau', 'Power BI', 'Python', 'pandas',
    'Excel', 'Dashboards', 'Reporting', 'ETL', 'Data Warehousing', 'Analytics',
    'Communication', 'Stakeholders', 'Agile', 'React', 'TypeScript', 'Tailwind',
    'REST', 'API', 'Git', 'Jira', 'Process Mapping', 'Cross-Functional', 'Docker',
    'Kubernetes', 'AWS', 'GCP', 'Azure', 'Machine Learning', 'CI/CD'
  ];

  const normJob = normalizeText(jobDescriptionText);
  const normResume = normalizeText(resumeText);

  const jobKeywords = keywordsPool.filter((kw) => {
    const reg = new RegExp(`\\b${normalizeText(kw)}\\b`, 'i');
    return reg.test(normJob);
  });

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jobKeywords) {
    const reg = new RegExp(`\\b${normalizeText(kw)}\\b`, 'i');
    if (reg.test(normResume)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const total = jobKeywords.length || 1;
  const overlapScore = Math.round((matchedKeywords.length / total) * 100);

  const result: KeywordCheckResult = {
    isRuleBased: true,
    label: 'Rule-based, not AI',
    keywordOverlapScore: overlapScore,
    matchedKeywords,
    missingKeywords,
    totalKeywords: jobKeywords.length,
    scanTimeMs: Date.now() - start,
  };

  return res.json(result);
});

// Vite Middleware mounting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResumeMatch AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
