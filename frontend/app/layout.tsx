import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";

export const metadata: Metadata = {
  title: "WebDoctor AI | Intelligent Website Audit & SEO Health Scanner",
  description: "WebDoctor AI performs real-time diagnostics, technology detection, security analysis, performance scoring, and generates actionable AI-powered recommendations.",
  keywords: ["Website Audit", "SEO Checker", "Lighthouse Performance", "Security Headers", "SaaS Diagnostics", "AI Recommendations"],
  authors: [{ name: "WebDoctor AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen relative overflow-x-hidden bg-[#02040a]">
        <SmoothScroll />
        
        {/* Deep space neural grid flares */}
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-violet-950/10 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-cyan-950/10 blur-[180px] pointer-events-none" />
        
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
