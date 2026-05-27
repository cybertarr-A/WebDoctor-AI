const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is missing"
  );
}

export interface ScanResult {
  id: string;
  url: string;
  overall_score: number;
  seo_score: number;
  performance_score: number;
  security_score: number;
  accessibility_score: number;
  technology_score: number;
  technology: string[];
  issues: string[];
  recommendations: string[];
  seo_details: any;
  performance_details: any;
  security_details: any;
  accessibility_details: any;
  domain_details: any;
  created_at: string;
}

export const apiClient = {
  /**
   * Submits a URL for scanning
   */
  async submitScan(url: string): Promise<ScanResult> {
    const response = await fetch(`${API_BASE}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error("Crawl failure occurred during scanning.");
    }
    return response.json();
  },

  /**
   * Fetches scan report details
   */
  async getScan(id: string): Promise<ScanResult> {
    const response = await fetch(`${API_BASE}/api/v1/scan/${id}`);
    if (!response.ok) {
      throw new Error(`Report for scan ID ${id} not found.`);
    }
    return response.json();
  },

  /**
   * Fetches recent scans list
   */
  async getRecentScans(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/api/v1/scans/recent`);
    if (!response.ok) {
      throw new Error("Unable to fetch scan logs from repository.");
    }
    return response.json();
  },

  /**
   * Sends a user chat query to the Antigravity AI assistant gateway
   */
  async askAIChat(scanId: string, question: string, history: any[], simplify = false): Promise<string> {
    const response = await fetch("/api/antigravity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "chat",
        scanId,
        question,
        history,
        simplify,
      }),
    });

    if (!response.ok) {
      throw new Error("Gemini AI bridge request failed.");
    }
    const data = await response.json();
    return data.reply;
  },

  /**
   * Fetches trend projection and priority issues forecast
   */
  async getPredictiveAnalytics(scanId: string): Promise<any> {
    const response = await fetch("/api/antigravity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "predictive",
        scanId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to compile trend projection.");
    }
    return response.json();
  }
};
