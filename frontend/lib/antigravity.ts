import { GoogleGenerativeAI } from "@google/generative-ai";

// Secure server-side check or optional client-side override
const getApiKey = () => {
  return process.env.NEXT_PUBLIC_GOOGLE_ANTIGRAVITY_KEY || 
         process.env.GEMINI_API_KEY || 
         "";
};

// Initialize the Google Generative AI client
export const initAntigravity = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Google Antigravity Key (GEMINI_API_KEY) is missing. Falling back to local mock insights.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getGeminiModel = (modelName = "gemini-1.5-flash") => {
  const client = initAntigravity();
  if (!client) return null;
  return client.getGenerativeModel({ model: modelName });
};

/**
 * Generates an executive technical summary & fix blueprint based on diagnostic scan report findings.
 */
export async function generateAISummary(scanReport: any): Promise<string> {
  const model = getGeminiModel();
  if (!model) {
    return "Local Mock: Audit shows missing security headers and visual bottlenecks. Please upgrade legacy scripts.";
  }

  const prompt = `
    You are Google's Antigravity AI integrated into WebDoctor-AI.
    Generate a high-fidelity, concise executive technical summary and fixing blueprint for the website: ${scanReport.url}.
    
    Overall Score: ${scanReport.overall_score}/100
    SEO Score: ${scanReport.seo_score}/100
    Performance Score: ${scanReport.performance_score}/100
    Security Score: ${scanReport.security_score}/100
    Accessibility Score: ${scanReport.accessibility_score}/100
    Detected Technologies: ${scanReport.technology.join(", ")}
    
    Issues list:
    ${scanReport.issues.map((i: string) => `- ${i}`).join("\n")}
    
    Format the response as beautiful Markdown, highlighting critical findings (using bold) and detailing 3 actionable high-impact fixes.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Antigravity AI generation error:", err);
    return "Error calling Google Antigravity AI. Please check your credentials.";
  }
}
