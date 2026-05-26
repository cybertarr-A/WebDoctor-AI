import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/antigravity";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, scanId, question, history, simplify } = body;

    if (action === "chat") {
      return await handleChatAction(scanId, question, history, simplify);
    } else if (action === "predictive") {
      return await handlePredictiveAction(scanId);
    } else {
      return NextResponse.json({ error: "Unsupported API action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Antigravity API Route error:", err);
    return NextResponse.json({ error: err.message || "Internal system error" }, { status: 500 });
  }
}

async function handleChatAction(scanId: string, question: string, history: any[], simplify: boolean) {
  const model = getGeminiModel();
  
  // High quality context description
  const contextPrompt = `
    You are Google's Antigravity AI assistant inside the WebDoctor-AI Platform.
    You help developers diagnose, understand, and fix technical website issues.
    The user is asking a question about website scan ID: ${scanId}.
    
    Current Question: "${question}"
    Simplify explanation for non-technical users ("Explain like I'm 5"): ${simplify ? "Yes, please explain in extremely simple terms using analogies." : "No, explain professionally with concrete code fixes and references."}
    
    Conversation History:
    ${history.map((msg: any) => `${msg.sender.toUpperCase()}: ${msg.text}`).join("\n")}
    
    Please provide an actionable, concise answer. If applicable, output a clean, formatted Markdown code block showing exactly how to resolve the issue (e.g. Nginx config, Javascript code, HTML elements, or CSS properties). Reference actual RFC standards or Web Vital benchmarks for citation.
  `;

  if (!model) {
    // Elegant fallback mock response
    let reply = `[LOCAL MOCK ENGINE] Thanks for asking about scan "${scanId}". `;
    if (question.toLowerCase().includes("hsts") || question.toLowerCase().includes("security")) {
      reply += `Strict-Transport-Security (HSTS) is a header that forces browsers to only connect via HTTPS. 
      \nTo fix this, add the following header to your server configuration:
      \n\`\`\`nginx
# For Nginx server blocks
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
\`\`\`
\nThis will prevent SSL protocol-downgrade attacks.`;
    } else if (question.toLowerCase().includes("seo") || question.toLowerCase().includes("alt")) {
      reply += `Adding \`alt\` tags to your images improves both SEO indexation and screen-reader accessibility.
      \nExample fix:
      \n\`\`\`html
<!-- Incorrect -->
<img src="/logo.png" />

<!-- Corrected -->
<img src="/logo.png" alt="WebDoctor AI brand identity logo" />
\`\`\``;
    } else {
      reply += `Based on the crawler profile, we recommend optimizing server response configurations. ${
        simplify 
          ? "Think of it like a doctor giving your site a vitamin booster so it runs faster!" 
          : "We recommend reviewing TTFB metrics and upgrading server caching systems."
      }`;
    }
    return NextResponse.json({ reply });
  }

  try {
    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    return NextResponse.json({ reply: response.text() });
  } catch (err: any) {
    return NextResponse.json({ reply: `Error communicating with Gemini: ${err.message}` });
  }
}

async function handlePredictiveAction(scanId: string) {
  const model = getGeminiModel();

  if (!model) {
    // Highly comprehensive Mock Predictive Analytics
    return NextResponse.json({
      scoreTrend: [
        { month: "Jan", score: 78, competitors: 72 },
        { month: "Feb", score: 80, competitors: 73 },
        { month: "Mar", score: 82, competitors: 75 },
        { month: "Apr", score: 81, competitors: 76 },
        { month: "May", score: 85, competitors: 78 },
        { month: "Jun", score: 89, competitors: 79 },
      ],
      anomalyAlerts: [
        { id: "a1", type: "warning", message: "Response speed spikes detected during peak hours (14:00 - 16:00 UTC). Suspected DB pool congestion.", date: "2026-05-25" },
        { id: "a2", type: "info", message: "Search crawlers identified 4 new internal redirection loops. SEO juice flow efficiency reduced.", date: "2026-05-24" }
      ],
      comparableSites: [
        { name: "Your Website", score: 85, speed: "260ms" },
        { name: "Industry Average", score: 76, speed: "450ms" },
        { name: "Top 10% Competitors", score: 92, speed: "110ms" }
      ],
      priorityIssues: [
        { id: "p1", title: "Missing HSTS cryptographic header", impact: "high", effort: "low", section: "Security" },
        { id: "p2", title: "Uncompressed high-res landing images", impact: "high", effort: "medium", section: "Performance" },
        { id: "p3", title: "Unused CSS and script bundles", impact: "medium", effort: "high", section: "Performance" }
      ]
    });
  }

  try {
    const prompt = `
      You are Google's Antigravity AI integrated into WebDoctor-AI.
      Generate a JSON object containing predictive forecasting, comparable competitive benchmarks, and prioritize items for website scan ID: ${scanId}.
      
      Respond ONLY with valid JSON inside a code block. The JSON must match the following structure precisely:
      {
        "scoreTrend": [
          { "month": "Jan", "score": 75, "competitors": 70 },
          { "month": "Feb", "score": 78, "competitors": 71 },
          { "month": "Mar", "score": 80, "competitors": 73 },
          { "month": "Apr", "score": 83, "competitors": 75 },
          { "month": "May", "score": 85, "competitors": 76 },
          { "month": "Jun", "score": 88, "competitors": 78 }
        ],
        "anomalyAlerts": [
          { "id": "a1", "type": "warning", "message": "Short explanation of some anomaly found in scan history", "date": "2026-05-25" }
        ],
        "comparableSites": [
          { "name": "Your Website", "score": 85, "speed": "280ms" },
          { "name": "Industry Benchmark", "score": 74, "speed": "490ms" },
          { "name": "Top Performers", "score": 93, "speed": "120ms" }
        ],
        "priorityIssues": [
          { "id": "p1", "title": "Implement Content-Security-Policy (CSP)", "impact": "high", "effort": "medium", "section": "Security" },
          { "id": "p2", "title": "Upgrade server-side compression to Brotli", "impact": "medium", "effort": "low", "section": "Performance" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up code block ticks if any
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return new NextResponse(jsonStr, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to generate AI predictive metrics: " + err.message }, { status: 500 });
  }
}
