const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const geminiApiKey = defineSecret("GEMINI_API_KEY");

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.5-pro",
];

const MAX_Q = 8000;
const MAX_ANS = 12000;
const MAX_REF = 12000;

function buildPrompt(question, studentAnswer, referenceAnswer) {
  return `You are an experienced Grade 10 Social Studies teacher. Evaluate the student's answer with DETAILED, SPECIFIC analysis.

IMPORTANT FORMAT RULES:
- Write primarily in English, with brief Chinese annotations in parentheses for key terms and important feedback.
- Example: "You correctly identified détente (缓和) as the period of relaxed tensions (紧张局势的缓和)."

QUESTION: ${question}

STUDENT'S ANSWER: ${studentAnswer}

REFERENCE ANSWER: ${referenceAnswer}

Respond in this EXACT JSON format (no markdown, no code fences):
{
  "score": <number 1-10>,
  "rating": "<Excellent|Good|Needs Improvement>",
  "correct_points": "<List each correct point the student made. Be specific — quote or paraphrase what they said and explain WHY it is correct. (对每个正确的要点进行具体分析)>",
  "incorrect_points": "<List anything the student got WRONG or stated inaccurately. Explain the correct information. If nothing is wrong, say 'No factual errors found.' (指出错误并纠正)>",
  "missing_points": "<List the KEY points from the reference answer that the student DID NOT mention. Explain why each point matters. (列出遗漏的关键要点并解释其重要性)>",
  "review_topics": "<Based on what was missing or wrong, list 2-4 specific topics/concepts the student should review. Be specific, e.g. 'Review the Helsinki Accords (赫尔辛基协议) and its three main agreements' rather than just 'Review détente'. (需要重点复习的知识点)>",
  "suggestion": "<Give encouraging, actionable advice on how to improve the answer. Mention a specific study strategy if helpful. (改进建议和学习策略)>"
}

Scoring guide: 9-10 = covers all key points accurately; 7-8 = covers most key points; 5-6 = partial coverage; 3-4 = significant gaps; 1-2 = mostly incorrect or very incomplete.`;
}

async function callGeminiModel(modelId, prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 16384 },
    }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const apiMsg =
      data.error?.message ||
      data.error?.status ||
      (typeof data.error === "string" ? data.error : JSON.stringify(data.error || data));
    throw new Error(`[${modelId}] ${resp.status} ${apiMsg}`);
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const block = data.promptFeedback || data.candidates?.[0]?.finishReason || "";
    throw new Error(`[${modelId}] No text in response. ${JSON.stringify(block).slice(0, 400)}`);
  }
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (_) {
        /* fall through */
      }
    }
    throw new Error(
      `[${modelId}] Invalid JSON from model: ${cleaned.slice(0, 200)}${cleaned.length > 200 ? "…" : ""}`
    );
  }
}

exports.ss10GradeAnswer = onCall(
  {
    secrets: [geminiApiKey],
    region: "us-central1",
    timeoutSeconds: 120,
    memory: "512MiB",
    cors: true,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required to use AI grading.");
    }

    const { question, studentAnswer, referenceAnswer } = request.data || {};

    if (typeof question !== "string" || typeof studentAnswer !== "string" || typeof referenceAnswer !== "string") {
      throw new HttpsError("invalid-argument", "Missing question, studentAnswer, or referenceAnswer.");
    }

    if (question.length > MAX_Q || studentAnswer.length > MAX_ANS || referenceAnswer.length > MAX_REF) {
      throw new HttpsError("invalid-argument", "Input too long.");
    }

    const prompt = buildPrompt(question, studentAnswer, referenceAnswer);
    const key = geminiApiKey.value();
    if (!key) {
      throw new HttpsError("failed-precondition", "Server missing GEMINI_API_KEY secret.");
    }

    let lastErr = null;
    for (const modelId of GEMINI_MODELS) {
      try {
        const parsed = await callGeminiModel(modelId, prompt, key);
        return { ...parsed, graderModel: modelId };
      } catch (e) {
        lastErr = e;
        console.warn("Gemini model failed:", modelId, e.message);
      }
    }

    const msg = lastErr?.message || "All Gemini models failed.";
    throw new HttpsError("internal", msg.slice(0, 500));
  }
);
