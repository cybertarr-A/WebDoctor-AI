"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Cpu, Globe, Activity, Eye, Zap, Search, HelpCircle } from "lucide-react";

interface HolographicHUDProps {
  activeModuleIndex: number | null;
  report: any; // Real backend ScanResponse
  onClose: () => void;
}

export default function HolographicHUD({
  activeModuleIndex,
  report,
  onClose
}: HolographicHUDProps) {
  if (activeModuleIndex === null || !report) return null;

  const modules = [
    { label: "Website Health", icon: Activity, color: "#10B981" },
    { label: "SEO Intelligence", icon: Search, color: "#a78bfa" },
    { label: "Security Scanner", icon: Shield, color: "#EF4444" },
    { label: "Performance Engine", icon: Zap, color: "#F59E0B" },
    { label: "Accessibility Analysis", icon: Eye, color: "#3B82F6" },
    { label: "AI Recommendations", icon: Cpu, color: "#ec4899" },
    { label: "Website DNA", icon: Globe, color: "#06b6d4" },
    { label: "Live Monitoring", icon: HelpCircle, color: "#14b8a6" }
  ];

  const currentModule = modules[activeModuleIndex];
  const Icon = currentModule.icon;

  const renderModuleData = () => {
    switch (activeModuleIndex) {
      case 0: // Website Health
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
              <span className="text-xs uppercase tracking-widest text-slate-400">Aggregate Score</span>
              <span className="text-3xl font-black font-mono text-emerald-400">{report.overall_score}/100</span>
            </div>
            <div className="space-y-3 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Health Index Metrics:</div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                <span className="text-slate-400">SEO Score:</span>
                <span className="text-emerald-400 font-bold">{report.seo_score}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                <span className="text-slate-400">Performance Score:</span>
                <span className="text-emerald-400 font-bold">{report.performance_score}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                <span className="text-slate-400">Security Score:</span>
                <span className="text-emerald-400 font-bold">{report.security_score}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-900">
                <span className="text-slate-400">Accessibility Score:</span>
                <span className="text-emerald-400 font-bold">{report.accessibility_score}</span>
              </div>
            </div>
          </div>
        );

      case 1: // SEO Intelligence
        const seo = report.seo_details || {};
        return (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-violet-500/5 p-3 rounded-xl border border-violet-500/20 space-y-1">
              <div className="text-[9px] uppercase tracking-wider text-slate-500">Document Title</div>
              <div className="text-slate-200 font-bold break-all">{seo.title || "No Title Tag Detected"}</div>
              <div className="text-[9px] text-slate-400">Length: {seo.title_length} chars</div>
            </div>
            <div className="bg-violet-500/5 p-3 rounded-xl border border-violet-500/20 space-y-1">
              <div className="text-[9px] uppercase tracking-wider text-slate-500">Meta Description</div>
              <div className="text-slate-200 break-all">{seo.meta_description || "Missing"}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                <span className="text-slate-400 block text-[9px]">SITEMAP</span>
                <span className={seo.has_sitemap ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {seo.has_sitemap ? "FOUND" : "MISSING"}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                <span className="text-slate-400 block text-[9px]">ROBOTS.TXT</span>
                <span className={seo.has_robots ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {seo.has_robots ? "FOUND" : "MISSING"}
                </span>
              </div>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-900">
              <span className="text-slate-400">Image Alt Compliance:</span>
              <span className={seo.images_without_alt > 0 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                {seo.images_total - seo.images_without_alt} / {seo.images_total}
              </span>
            </div>
          </div>
        );

      case 2: // Security Scanner
        const sec = report.security_details || {};
        return (
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className={`p-2.5 rounded-lg border ${sec.https_enabled ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-rose-500/20 bg-rose-500/5 text-rose-400"}`}>
                <span className="text-[9px] uppercase block">SSL (HTTPS)</span>
                <span className="font-bold">{sec.https_enabled ? "ACTIVE" : "INACTIVE"}</span>
              </div>
              <div className={`p-2.5 rounded-lg border ${sec.hsts_enabled ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-rose-500/20 bg-rose-500/5 text-rose-400"}`}>
                <span className="text-[9px] uppercase block">HSTS</span>
                <span className="font-bold">{sec.hsts_enabled ? "ENABLED" : "DISABLED"}</span>
              </div>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Content Security Policy (CSP):</span>
              <span className={sec.csp_enabled ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {sec.csp_enabled ? "ENABLED" : "MISSING"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Referrer Policy:</span>
              <span className="text-slate-200">{sec.referrer_policy || "Not Set"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">X-Frame-Options:</span>
              <span className="text-slate-200">{sec.x_frame_options || "Not Set"}</span>
            </div>
            {sec.missing_headers?.length > 0 && (
              <div className="mt-2 text-rose-400">
                <span className="text-[9px] uppercase block text-slate-500 mb-1">Missing Security Headers:</span>
                <div className="flex flex-wrap gap-1">
                  {sec.missing_headers.map((h: string, idx: number) => (
                    <span key={idx} className="bg-rose-500/5 border border-rose-500/20 px-2 py-0.5 rounded text-[10px]">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Performance Engine
        const perf = report.performance_details || {};
        return (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 flex justify-between items-center mb-2">
              <span className="text-slate-400">Response Speed Index</span>
              <span className="text-2xl font-black text-amber-400">{perf.response_time_ms.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Time-To-First-Byte (TTFB):</span>
              <span className="text-slate-200 font-bold">{perf.ttfb_ms} ms</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Largest Contentful Paint (LCP):</span>
              <span className="text-slate-200 font-bold">{perf.largest_contentful_paint_s} s</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Total Blocking Time (TBT):</span>
              <span className="text-slate-200 font-bold">{perf.total_blocking_time_ms} ms</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Estimated Page Size:</span>
              <span className="text-slate-200 font-bold">{perf.page_size_kb.toFixed(0)} KB</span>
            </div>
          </div>
        );

      case 4: // Accessibility Analysis
        const access = report.accessibility_details || {};
        return (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 flex justify-between items-center mb-2">
              <span className="text-slate-400">Contrast & Tags Score</span>
              <span className="text-2xl font-black text-blue-400">{access.score}/100</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">HTML Lang Declaration:</span>
              <span className={access.html_lang_present ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {access.html_lang_present ? "PRESENT" : "MISSING"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">ARIA labels compliance:</span>
              <span className={access.aria_labels_present ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {access.aria_labels_present ? "CONFIRMED" : "UNSTABLE"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Missing Image Alt Tags:</span>
              <span className={access.missing_alt_tags > 0 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                {access.missing_alt_tags} issues
              </span>
            </div>
          </div>
        );

      case 5: // AI Recommendations
        return (
          <div className="space-y-2.5 font-mono text-[11px] max-h-[300px] overflow-y-auto pr-1">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1">Actionable fixing blueprints:</span>
            {report.recommendations?.map((rec: string, idx: number) => (
              <div
                key={idx}
                className="bg-pink-500/5 border border-pink-500/20 p-3 rounded-xl text-pink-300 flex items-start gap-2.5"
              >
                <span className="bg-pink-500/10 text-[9px] border border-pink-500/30 px-1.5 py-0.5 rounded font-black mt-0.5">FIX</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        );

      case 6: // Website DNA
        const domain = report.domain_details || {};
        return (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/20 space-y-2 mb-2">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Detected Stack (Tech footprint):</span>
              <div className="flex flex-wrap gap-1.5">
                {report.technology?.map((tech: string, idx: number) => (
                  <span key={idx} className="bg-cyan-950 border border-cyan-900 text-cyan-300 px-2 py-0.5 rounded text-[10px]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Registrar:</span>
              <span className="text-slate-200 font-bold">{domain.registrar}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Domain Age:</span>
              <span className="text-slate-200 font-bold">{domain.domain_age_days} days</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-900">
              <span className="text-slate-400">Creation Date:</span>
              <span className="text-slate-200 font-bold">{domain.creation_date}</span>
            </div>
          </div>
        );

      case 7: // Live Monitoring
        return (
          <div className="space-y-3 font-mono text-xs max-h-[300px] overflow-y-auto pr-1">
            <div className="bg-teal-500/5 p-3 rounded-xl border border-teal-500/20 text-teal-400 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span className="text-[9px] uppercase font-black">Timeline Monitor Status: Online</span>
              </div>
              <div className="text-[10px] text-slate-400">Tracking diagnostics telemetry streams. Scan registered at {new Date(report.created_at).toLocaleTimeString()}.</div>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] uppercase text-slate-500 block">Crawl Timeline Events:</span>
              {report.issues?.slice(0, 5).map((iss: string, idx: number) => (
                <div key={idx} className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg flex items-start gap-2">
                  <span className="text-amber-400 font-bold">⚠️</span>
                  <span className="text-[10px] text-slate-300">{iss}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 80, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 140 }}
        className="fixed top-20 right-6 z-40 w-full max-w-sm glass-panel border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-black/75"
        style={{ borderColor: `${currentModule.color}40` }}
      >
        {/* Animated matrix light glow band */}
        <div 
          className="h-1 w-full animate-pulse" 
          style={{ backgroundColor: currentModule.color }} 
        />

        {/* HUD Header */}
        <div className="p-4 border-b border-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" style={{ color: currentModule.color }} />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-100 font-heading">
              {currentModule.label}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* HUD Data Contents */}
        <div className="p-5 flex-1 overflow-y-auto">
          {renderModuleData()}
        </div>

        {/* Holographic Export Button Panel */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-900/50 flex flex-col gap-2">
          <button
            onClick={() => {
              const cleanUrl = report.url?.replace(/https?:\/\//i, "") || "example.com";
              const formattedDate = new Date(report.created_at).toLocaleString();
              
              // Calculate Letter Grade
              const score = report.overall_score;
              let letterGrade = "F";
              let gradeColor = "#EF4444";
              let gradeText = "Critical Action Required";
              
              if (score >= 90) {
                letterGrade = "A";
                gradeColor = "#10B981";
                gradeText = "Excellent Health";
              } else if (score >= 80) {
                letterGrade = "B";
                gradeColor = "#8B5CF6";
                gradeText = "Good Health";
              } else if (score >= 70) {
                letterGrade = "C";
                gradeColor = "#3B82F6";
                gradeText = "Moderate Health";
              } else if (score >= 60) {
                letterGrade = "D";
                gradeColor = "#F59E0B";
                gradeText = "At Risk";
              }
              
              // Helper to classify Core Web Vitals
              const getVitalsStatus = (metric: string, val: number) => {
                if (metric === "lcp") {
                  return val <= 2.5 ? { label: "GOOD", color: "#10B981" } : val <= 4.0 ? { label: "NEEDS IMPROVEMENT", color: "#F59E0B" } : { label: "POOR", color: "#EF4444" };
                }
                if (metric === "fcp") {
                  return val <= 1.8 ? { label: "GOOD", color: "#10B981" } : val <= 3.0 ? { label: "NEEDS IMPROVEMENT", color: "#F59E0B" } : { label: "POOR", color: "#EF4444" };
                }
                if (metric === "tbt") {
                  return val <= 200 ? { label: "GOOD", color: "#10B981" } : val <= 600 ? { label: "NEEDS IMPROVEMENT", color: "#F59E0B" } : { label: "POOR", color: "#EF4444" };
                }
                return { label: "OPTIMAL", color: "#10B981" };
              };

              const lcpVal = report.performance_details?.largest_contentful_paint_s || 0;
              const fcpVal = report.performance_details?.first_contentful_paint_s || 0;
              const tbtVal = report.performance_details?.total_blocking_time_ms || 0;

              const lcpStatus = getVitalsStatus("lcp", lcpVal);
              const fcpStatus = getVitalsStatus("fcp", fcpVal);
              const tbtStatus = getVitalsStatus("tbt", tbtVal);
              
              const printWindow = window.open("", "_blank");
              if (!printWindow) {
                alert("Please allow popups to export the PDF report.");
                return;
              }
              
              const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                  <title>WebDoctor AI Audit Report - ${cleanUrl}</title>
                  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
                  <style>
                    * {
                      box-sizing: border-box;
                      margin: 0;
                      padding: 0;
                    }
                    body {
                      font-family: 'Outfit', sans-serif;
                      background-color: #030712;
                      color: #f3f4f6;
                      padding: 40px;
                      line-height: 1.6;
                    }
                    .container {
                      max-width: 950px;
                      margin: 0 auto;
                      position: relative;
                    }
                    .page {
                      border: 1px solid #1f2937;
                      background: linear-gradient(135deg, #090d16 0%, #030712 100%);
                      border-radius: 24px;
                      padding: 50px;
                      margin-bottom: 40px;
                      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                      min-height: 1000px;
                      display: flex;
                      flex-direction: column;
                      justify-content: space-between;
                    }
                    .header {
                      display: flex;
                      justify-content: space-between;
                      align-items: flex-start;
                      border-bottom: 2px solid #1f2937;
                      padding-bottom: 25px;
                      margin-bottom: 30px;
                    }
                    .logo-section h1 {
                      font-size: 26px;
                      font-weight: 900;
                      letter-spacing: 2px;
                      color: #f3f4f6;
                      text-transform: uppercase;
                      margin-bottom: 4px;
                    }
                    .logo-section span {
                      font-family: 'JetBrains Mono', monospace;
                      font-size: 10px;
                      color: #06b6d4;
                      text-transform: uppercase;
                      letter-spacing: 3px;
                    }
                    .meta-info {
                      text-align: right;
                      font-family: 'JetBrains Mono', monospace;
                      font-size: 11px;
                      color: #9ca3af;
                    }
                    .meta-info strong {
                      color: #f3f4f6;
                    }
                    .executive-summary-box {
                      background: rgba(31, 41, 55, 0.25);
                      border: 1px solid rgba(255, 255, 255, 0.05);
                      border-radius: 20px;
                      padding: 30px;
                      margin-bottom: 35px;
                    }
                    .grade-hero {
                      display: flex;
                      align-items: center;
                      gap: 30px;
                      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                      padding-bottom: 25px;
                      margin-bottom: 25px;
                    }
                    .grade-circle {
                      width: 100px;
                      height: 100px;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 52px;
                      font-weight: 900;
                      color: #030712;
                      box-shadow: 0 0 30px rgba(6, 182, 212, 0.2);
                    }
                    .grade-desc h2 {
                      font-size: 22px;
                      font-weight: 800;
                      color: #f3f4f6;
                    }
                    .grade-desc p {
                      font-size: 13px;
                      color: #9ca3af;
                      margin-top: 4px;
                    }
                    .summary-text h3 {
                      font-size: 13px;
                      text-transform: uppercase;
                      color: #06b6d4;
                      letter-spacing: 2px;
                      margin-bottom: 10px;
                    }
                    .summary-text p {
                      font-size: 13.5px;
                      color: #d1d5db;
                    }
                    .grid-scores {
                      display: grid;
                      grid-template-columns: repeat(4, 1fr);
                      gap: 20px;
                      margin-bottom: 35px;
                    }
                    .score-card {
                      background: rgba(31, 41, 55, 0.3);
                      border: 1px solid rgba(255, 255, 255, 0.05);
                      border-radius: 16px;
                      padding: 20px;
                      text-align: center;
                    }
                    .score-value {
                      font-size: 32px;
                      font-weight: 900;
                      margin-top: 5px;
                    }
                    .score-label {
                      font-size: 10px;
                      text-transform: uppercase;
                      color: #9ca3af;
                      letter-spacing: 1px;
                    }
                    .section-title {
                      font-size: 15px;
                      font-weight: 800;
                      text-transform: uppercase;
                      letter-spacing: 2px;
                      color: #f3f4f6;
                      border-left: 4px solid #06b6d4;
                      padding-left: 12px;
                      margin: 40px 0 20px 0;
                    }
                    .details-grid {
                      display: grid;
                      grid-template-columns: repeat(2, 1fr);
                      gap: 20px;
                      margin-bottom: 35px;
                    }
                    .details-block {
                      background: rgba(31, 41, 55, 0.2);
                      border: 1px solid rgba(255, 255, 255, 0.03);
                      border-radius: 16px;
                      padding: 24px;
                    }
                    .details-block h3 {
                      font-size: 13px;
                      text-transform: uppercase;
                      color: #06b6d4;
                      margin-bottom: 18px;
                      letter-spacing: 1.5px;
                    }
                    .row {
                      display: flex;
                      justify-content: space-between;
                      font-size: 12.5px;
                      padding: 10px 0;
                      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    }
                    .row:last-child {
                      border-bottom: none;
                    }
                    .row-label {
                      color: #9ca3af;
                    }
                    .row-value {
                      font-weight: 600;
                      color: #f3f4f6;
                    }
                    .vital-row {
                      display: flex;
                      flex-direction: column;
                      padding: 14px 0;
                      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    }
                    .vital-row-header {
                      display: flex;
                      justify-content: space-between;
                      margin-bottom: 8px;
                    }
                    .vital-bar-container {
                      height: 6px;
                      background: rgba(255, 255, 255, 0.05);
                      border-radius: 3px;
                      overflow: hidden;
                    }
                    .vital-bar {
                      height: 100%;
                      border-radius: 3px;
                    }
                    .vital-badge {
                      font-size: 9px;
                      font-family: 'JetBrains Mono', monospace;
                      font-weight: bold;
                      padding: 2px 8px;
                      border-radius: 4px;
                    }
                    .tech-tag {
                      display: inline-block;
                      background: rgba(6, 182, 212, 0.08);
                      border: 1px solid rgba(6, 182, 212, 0.18);
                      color: #22d3ee;
                      padding: 6px 14px;
                      border-radius: 8px;
                      font-size: 11.5px;
                      font-weight: 600;
                      margin: 0 6px 8px 0;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                    }
                    .security-explanation {
                      background: rgba(239, 68, 68, 0.03);
                      border: 1px dashed rgba(239, 68, 68, 0.15);
                      border-radius: 12px;
                      padding: 15px;
                      margin-top: 15px;
                      font-size: 11.5px;
                      color: #fca5a5;
                    }
                    .recommendations-list {
                      display: flex;
                      flex-direction: column;
                      gap: 15px;
                    }
                    .rec-item {
                      background: rgba(236, 72, 153, 0.04);
                      border: 1px solid rgba(236, 72, 153, 0.15);
                      border-radius: 14px;
                      padding: 20px;
                      display: flex;
                      gap: 15px;
                      align-items: flex-start;
                    }
                    .rec-badge {
                      background: rgba(236, 72, 153, 0.15);
                      border: 1px solid rgba(236, 72, 153, 0.3);
                      color: #ec4899;
                      font-size: 10px;
                      font-weight: 900;
                      font-family: 'JetBrains Mono', monospace;
                      padding: 3px 10px;
                      border-radius: 5px;
                      flex-shrink: 0;
                    }
                    .rec-body h4 {
                      font-size: 13.5px;
                      font-weight: 700;
                      color: #f3f4f6;
                      margin-bottom: 4px;
                    }
                    .rec-body p {
                      font-size: 12.5px;
                      color: #f472b6;
                    }
                    .footer {
                      margin-top: 40px;
                      border-top: 1px solid #1f2937;
                      padding-top: 20px;
                      display: flex;
                      justify-content: space-between;
                      font-family: 'JetBrains Mono', monospace;
                      font-size: 9px;
                      color: #4b5563;
                      text-transform: uppercase;
                    }
                    
                    @media print {
                      body {
                        background-color: #ffffff;
                        color: #111827;
                        padding: 0;
                      }
                      .page {
                        border: none !important;
                        background: #ffffff !important;
                        color: #111827 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        page-break-before: always;
                        min-height: auto !important;
                        margin-bottom: 0 !important;
                      }
                      .page:first-child {
                        page-break-before: avoid;
                      }
                      .logo-section h1 {
                        color: #111827 !important;
                      }
                      .logo-section span {
                        color: #0891b2 !important;
                      }
                      .meta-info {
                        color: #4b5563 !important;
                      }
                      .meta-info strong {
                        color: #111827 !important;
                      }
                      .executive-summary-box {
                        background: #f9fafb !important;
                        border: 1px solid #e5e7eb !important;
                      }
                      .grade-circle {
                        background: #111827 !important;
                        color: #ffffff !important;
                      }
                      .grade-desc h2 {
                        color: #111827 !important;
                      }
                      .grade-desc p {
                        color: #4b5563 !important;
                      }
                      .summary-text p {
                        color: #374151 !important;
                      }
                      .score-card {
                        background: #f3f4f6 !important;
                        border: 1px solid #e5e7eb !important;
                      }
                      .score-label {
                        color: #4b5563 !important;
                      }
                      .score-value {
                        color: #111827 !important;
                      }
                      .section-title {
                        color: #111827 !important;
                        border-left-color: #0891b2 !important;
                      }
                      .details-block {
                        background: #f9fafb !important;
                        border: 1px solid #e5e7eb !important;
                      }
                      .details-block h3 {
                        color: #0891b2 !important;
                      }
                      .row {
                        border-bottom-color: #e5e7eb !important;
                      }
                      .row-label {
                        color: #4b5563 !important;
                      }
                      .row-value {
                        color: #111827 !important;
                      }
                      .vital-bar-container {
                        background: #e5e7eb !important;
                      }
                      .tech-tag {
                        background: #f3f4f6 !important;
                        border-color: #d1d5db !important;
                        color: #111827 !important;
                      }
                      .security-explanation {
                        background: #fff5f5 !important;
                        border-color: #feb2b2 !important;
                        color: #c53030 !important;
                      }
                      .rec-item {
                        background: #fff5f5 !important;
                        border-color: #fed7d7 !important;
                      }
                      .rec-badge {
                        background: #fee2e2 !important;
                        border-color: #fca5a5 !important;
                        color: #c53030 !important;
                      }
                      .rec-body h4 {
                        color: #111827 !important;
                      }
                      .rec-body p {
                        color: #9b2c2c !important;
                      }
                      .footer {
                        border-top-color: #e5e7eb !important;
                        color: #9ca3af !important;
                      }
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    
                    <!-- PAGE 1: TITLE PAGE & EXECUTIVE SUMMARY -->
                    <div class="page">
                      <div>
                        <div class="header">
                          <div class="logo-section">
                            <h1>WebDoctor AI</h1>
                            <span>Diagnostics Protocol Report</span>
                          </div>
                          <div class="meta-info">
                            <div>TARGET HOST: <strong>${cleanUrl.toUpperCase()}</strong></div>
                            <div>AUDIT TIMESTAMP: <strong>${formattedDate}</strong></div>
                          </div>
                        </div>
                        
                        <div class="section-title" style="margin-top: 20px;">Executive Summary Analysis</div>
                        
                        <div class="executive-summary-box">
                          <div class="grade-hero">
                            <div class="grade-circle" style="background-color: ${gradeColor};">${letterGrade}</div>
                            <div class="grade-desc">
                              <h2>Overall Health Grade: ${letterGrade}</h2>
                              <p>WebDoctor telemetry aggregation compiled an overall score of <strong>${score}%</strong>.</p>
                            </div>
                          </div>
                          <div class="summary-text">
                            <h3>Engine Diagnostics</h3>
                            <p>
                              A deep automated security, speed index, search visibility, and structural accessibility scan has been executed for 
                              <strong>${cleanUrl}</strong>. Telemetry readings reveal a composite grade rating of ${letterGrade} (${score} out of 100 possible points). 
                              ${score >= 80 ? "The website exhibits robust performance structures, but still harbors configurations requiring optimization." : "Multiple critical risk vectors have been flagged that require immediate attention to protect SEO rank, ensure site stability, and seal security configurations."}
                            </p>
                          </div>
                        </div>
                        
                        <div class="grid-scores">
                          <div class="score-card">
                            <div class="score-label">SEO score</div>
                            <div class="score-value" style="color: #a78bfa;">${report.seo_score}%</div>
                          </div>
                          <div class="score-card">
                            <div class="score-label">performance</div>
                            <div class="score-value" style="color: #f59e0b;">${report.performance_score}%</div>
                          </div>
                          <div class="score-card">
                            <div class="score-label">security</div>
                            <div class="score-value" style="color: #ef4444;">${report.security_score}%</div>
                          </div>
                          <div class="score-card">
                            <div class="score-label">accessibility</div>
                            <div class="score-value" style="color: #3b82f6;">${report.accessibility_score}%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div class="footer">
                        <span>REPORT PART 1 OF 3 • SHA256-${report.id ? report.id.slice(0, 10) : 'demo'}</span>
                        <span>CONFIDENTIAL PROTOCOL REPORT</span>
                      </div>
                    </div>
                    
                    <!-- PAGE 2: CORE WEB VITALS & TELEMETRY -->
                    <div class="page">
                      <div>
                        <div class="header">
                          <div class="logo-section">
                            <h1>WebDoctor AI</h1>
                            <span>Diagnostics Protocol Report</span>
                          </div>
                          <div class="meta-info">
                            <div>HOST: <strong>${cleanUrl.toUpperCase()}</strong></div>
                          </div>
                        </div>
                        
                        <div class="section-title" style="margin-top: 10px;">Core Web Vitals & Telemetry Details</div>
                        
                        <div class="details-grid">
                          <div class="details-block">
                            <h3>Core Web Vitals (Speed Index)</h3>
                            
                            <div class="vital-row">
                              <div class="vital-row-header">
                                <span class="row-label">Largest Contentful Paint (LCP)</span>
                                <span class="vital-badge" style="background: ${lcpStatus.color}20; color: ${lcpStatus.color};">${lcpVal}s - ${lcpStatus.label}</span>
                              </div>
                              <div class="vital-bar-container">
                                <div class="vital-bar" style="width: ${Math.min(100, (lcpVal/6)*100)}%; background-color: ${lcpStatus.color};"></div>
                              </div>
                            </div>
                            
                            <div class="vital-row">
                              <div class="vital-row-header">
                                <span class="row-label">First Contentful Paint (FCP)</span>
                                <span class="vital-badge" style="background: ${fcpStatus.color}20; color: ${fcpStatus.color};">${fcpVal}s - ${fcpStatus.label}</span>
                              </div>
                              <div class="vital-bar-container">
                                <div class="vital-bar" style="width: ${Math.min(100, (fcpVal/4)*100)}%; background-color: ${fcpStatus.color};"></div>
                              </div>
                            </div>
                            
                            <div class="vital-row">
                              <div class="vital-row-header">
                                <span class="row-label">Total Blocking Time (TBT)</span>
                                <span class="vital-badge" style="background: ${tbtStatus.color}20; color: ${tbtStatus.color};">${tbtVal}ms - ${tbtStatus.label}</span>
                              </div>
                              <div class="vital-bar-container">
                                <div class="vital-bar" style="width: ${Math.min(100, (tbtVal/800)*100)}%; background-color: ${tbtStatus.color};"></div>
                              </div>
                            </div>
                          </div>
                          
                          <div class="details-block">
                            <h3>SEO & DOM Telemetry</h3>
                            <div class="row">
                              <span class="row-label">Document Title Length</span>
                              <span class="row-value">${report.seo_details?.title_length || 0} chars</span>
                            </div>
                            <div class="row">
                              <span class="row-label">Meta Description Length</span>
                              <span class="row-value">${report.seo_details?.meta_description_length || 0} chars</span>
                            </div>
                            <span class="row-label" style="display:block; font-size:10px; margin-top:8px; margin-bottom: 2px;">META TITLE:</span>
                            <p style="font-size:11px; font-family:'JetBrains Mono'; color:#cbd5e1; word-break:break-all; margin-bottom:12px;">"${report.seo_details?.title || 'None declared'}"</p>
                            
                            <div class="row">
                              <span class="row-label">Sitemap Declared (has_sitemap)</span>
                              <span class="row-value" style="color: ${report.seo_details?.has_sitemap ? '#10b981' : '#ef4444'};">${report.seo_details?.has_sitemap ? 'ACTIVE' : 'MISSING'}</span>
                            </div>
                            <div class="row">
                              <span class="row-label">Robots Policy (has_robots)</span>
                              <span class="row-value" style="color: ${report.seo_details?.has_robots ? '#10b981' : '#ef4444'};">${report.seo_details?.has_robots ? 'ACTIVE' : 'MISSING'}</span>
                            </div>
                          </div>
                          
                          <div class="details-block" style="grid-column: span 2;">
                            <h3>Network & Latencies</h3>
                            <div class="row">
                              <span class="row-label">Time-To-First-Byte (TTFB)</span>
                              <span class="row-value">${report.performance_details?.ttfb_ms || 0} ms</span>
                            </div>
                            <div class="row">
                              <span class="row-label">Full Page Asset Weight (Estimated)</span>
                              <span class="row-value">${report.performance_details?.page_size_kb ? report.performance_details.page_size_kb.toFixed(0) : 0} KB</span>
                            </div>
                            <div class="row">
                              <span class="row-label">SSL Handshake Connection Timing</span>
                              <span class="row-value">${report.performance_details?.response_time_ms ? report.performance_details.response_time_ms.toFixed(0) : 0} ms</span>
                            </div>
                          </div>
                        </div>
                        
                        <div class="section-title">Detected DNA Stack footprint</div>
                        <div class="details-block">
                          ${report.technology?.map(tech => `<span class="tech-tag">${tech}</span>`).join("") || 'No stack technology markers recorded.'}
                        </div>
                      </div>
                      
                      <div class="footer">
                        <span>REPORT PART 2 OF 3 • SHA256-${report.id ? report.id.slice(0, 10) : 'demo'}</span>
                        <span>CONFIDENTIAL PROTOCOL REPORT</span>
                      </div>
                    </div>
                    
                    <!-- PAGE 3: SECURITY SCANNER PROTOCOL -->
                    <div class="page">
                      <div>
                        <div class="header">
                          <div class="logo-section">
                            <h1>WebDoctor AI</h1>
                            <span>Diagnostics Protocol Report</span>
                          </div>
                          <div class="meta-info">
                            <div>HOST: <strong>${cleanUrl.toUpperCase()}</strong></div>
                          </div>
                        </div>
                        
                        <div class="section-title" style="margin-top: 10px;">Security & Encryption Protocol Audit</div>
                        
                        <div class="details-grid">
                          <div class="details-block" style="grid-column: span 2;">
                            <h3>SSL Certificate & Secure Encryption</h3>
                            <div class="row">
                              <span class="row-label">SSL Active Status (https_enabled)</span>
                              <span class="row-value" style="color: ${report.security_details?.https_enabled ? '#10b981' : '#ef4444'};">${report.security_details?.https_enabled ? 'HTTPS ENCRYPTION SECURE' : 'INSECURE HTTP CRAWL'}</span>
                            </div>
                            <div class="row">
                              <span class="row-label">HSTS Enforced (Strict-Transport-Security)</span>
                              <span class="row-value" style="color: ${report.security_details?.hsts_enabled ? '#10b981' : '#ef4444'};">${report.security_details?.hsts_enabled ? 'ENABLED' : 'MISSING'}</span>
                            </div>
                            <div class="row">
                              <span class="row-label">CSP Active Policy (Content-Security-Policy)</span>
                              <span class="row-value" style="color: ${report.security_details?.csp_enabled ? '#10b981' : '#ef4444'};">${report.security_details?.csp_enabled ? 'CONFIGURED' : 'MISSING'}</span>
                            </div>
                            <div class="row">
                              <span class="row-label">Referrer Policy Header</span>
                              <span class="row-value">${report.security_details?.referrer_policy || "Not Set"}</span>
                            </div>
                            <div class="row">
                              <span class="row-label">Framing Directives (X-Frame-Options)</span>
                              <span class="row-value">${report.security_details?.x_frame_options || "Not Set"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div class="section-title" style="color: #ef4444; border-left-color: #ef4444;">Flagged Vulnerability Exposures</div>
                        
                        <div class="details-block">
                          <h3 style="color: #ef4444;">Missing Security Header Risk Assessment</h3>
                          <p style="font-size:12px; color:#9ca3af; margin-bottom:15px;">
                            The diagnostic engine determined the target domain lacks key security headers. Without these, your host server is highly exposed:
                          </p>
                          
                          ${report.security_details?.missing_headers?.includes("Strict-Transport-Security") ? `
                            <div class="security-explanation">
                              <strong>❌ Strict-Transport-Security (HSTS) Missing:</strong> Forces browsers to interact with your site ONLY using secure HTTPS connections. Without HSTS, attackers can intercept requests and execute Man-in-the-Middle (MITM) session hijacking.
                            </div>
                          ` : ''}
                          
                          ${report.security_details?.missing_headers?.includes("Content-Security-Policy") ? `
                            <div class="security-explanation">
                              <strong>❌ Content-Security-Policy (CSP) Missing:</strong> Declares which dynamic resources (JS, CSS, fonts, frames) are safe to fetch and run. Leaving CSP unconfigured leaves your users highly vulnerable to Cross-Site Scripting (XSS) code injections and clickjacking exploits.
                            </div>
                          ` : ''}
                          
                          ${report.security_details?.missing_headers?.length === 0 ? `
                            <div class="security-explanation" style="background: rgba(16, 185, 129, 0.03); border-color: rgba(16, 185, 129, 0.15); color: #a7f3d0;">
                              <strong>✔ Comprehensive Security Alignment:</strong> No major missing security headers detected! The host is enforcing secure framing and script loading principles.
                            </div>
                          ` : ''}
                        </div>
                      </div>
                      
                      <div class="footer">
                        <span>REPORT PART 3 OF 3 • SHA256-${report.id ? report.id.slice(0, 10) : 'demo'}</span>
                        <span>CONFIDENTIAL PROTOCOL REPORT</span>
                      </div>
                    </div>
                    
                    <!-- PAGE 4: DETAILED AI REMEDIATION BLUEPRINT -->
                    <div class="page" style="page-break-before: always;">
                      <div>
                        <div class="header">
                          <div class="logo-section">
                            <h1>WebDoctor AI</h1>
                            <span>Diagnostics Protocol Report</span>
                          </div>
                          <div class="meta-info">
                            <div>HOST: <strong>${cleanUrl.toUpperCase()}</strong></div>
                          </div>
                        </div>
                        
                        <div class="section-title" style="color: #ec4899; border-left-color: #ec4899; margin-top: 10px;">Llama 3.1 AI Actionable Remediation Blueprint</div>
                        
                        <div class="recommendations-list">
                          ${report.recommendations?.map((rec, idx) => `
                            <div class="rec-item">
                              <span class="rec-badge">REMEDY ${idx + 1}</span>
                              <div class="rec-body">
                                <h4>Priority Action Plan</h4>
                                <p>${rec}</p>
                              </div>
                            </div>
                          `).join("") || 'No structural suggestions returned.'}
                        </div>
                      </div>
                      
                      <div class="footer">
                        <span>VERIFICATION SIGNATURE: SHA256-${report.id ? report.id.slice(0, 10) : 'demo'}</span>
                        <span>SYSTEM GENERATED BY WEBDOCCTOR_AI • FINAL</span>
                      </div>
                    </div>
                    
                  </div>
                  
                  <script>
                    window.onload = function() {
                      setTimeout(function() {
                        window.print();
                      }, 500);
                    };
                  </script>
                </body>
                </html>
              `;
              
              printWindow.document.open();
              printWindow.document.write(htmlContent);
              printWindow.document.close();
            }}
            className="w-full py-2.5 rounded-xl border border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 select-none shadow-[0_0_15px_rgba(6,182,212,0.1)] active:scale-95 cursor-pointer pointer-events-auto"
          >
            <span className="relative w-2 h-2 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
            </span>
            Export PDF Report
          </button>
          
          <button
            onClick={async () => {
              try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const downloadUrl = `${apiBase}/api/v1/scan/${report.id}/download`;
                
                const response = await fetch(downloadUrl);
                if (response.ok) {
                  const blob = await response.blob();
                  const blobUrl = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = blobUrl;
                  
                  const cleanDomain = report.url?.replace(/https?:\/\//i, "").replace(/[\/:*?"<>|]/g, "_") || "report";
                  a.download = `webdoctor_report_${cleanDomain}.txt`;
                  
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(blobUrl);
                } else {
                  alert("Failed to compile and download report.");
                }
              } catch (err) {
                console.error("Export error:", err);
                alert("An error occurred while downloading the report.");
              }
            }}
            className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-[10px] font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 select-none active:scale-95 cursor-pointer pointer-events-auto"
          >
            Download Markdown TXT
          </button>
        </div>

        {/* HUD Coordinate Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-900 text-[8px] font-mono text-slate-500 flex justify-between uppercase">
          <span>COORDINATES: X: {activeModuleIndex.toFixed(2)} Y: {Math.sin(activeModuleIndex).toFixed(2)}</span>
          <span>WEBDOC_AI_SYS_V1</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
