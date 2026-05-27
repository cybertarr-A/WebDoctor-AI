"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useAppStore } from "@/lib/store";
import { useDiagnosticStream } from "@/hooks/useDiagnosticStream";

// 3D & Spatial UI Components
import AICore from "@/components/3d/AICore";
import OrbitalModuleNode from "@/components/3d/OrbitalModuleNode";
import SpatialCameraRig from "@/components/3d/SpatialCameraRig";
import HolographicHUD from "@/components/ui/HolographicHUD";
import NeuralInputDock from "@/components/ui/NeuralInputDock";

// Static positions for the 8 orbiting diagnostic nodes
const MODULE_POSITIONS: [number, number, number][] = [
  [2.4, 0.8, 1.2],   // 0. Website Health (Green)
  [-2.2, 1.5, -0.6], // 1. SEO Intelligence (Violet)
  [2.1, -1.6, 0.8],  // 2. Security Scanner (Red)
  [-2.0, -1.0, 1.4], // 3. Performance Engine (Amber)
  [0.8, 2.3, -0.8],  // 4. Accessibility Analysis (Blue)
  [1.4, -2.2, -1.2], // 5. AI Recommendations (Pink)
  [-2.6, 0.3, 1.6],  // 6. Website DNA (Cyan)
  [-0.6, -2.5, -0.5] // 7. Live Monitoring (Teal)
];

const MODULE_LABELS = [
  { name: "Website Health", color: "#10B981" },
  { name: "SEO Intelligence", color: "#a78bfa" },
  { name: "Security Scanner", color: "#EF4444" },
  { name: "Performance Engine", color: "#F59E0B" },
  { name: "Accessibility Analysis", color: "#3B82F6" },
  { name: "AI Recommendations", color: "#ec4899" },
  { name: "Website DNA", color: "#06b6d4" },
  { name: "Live Monitoring", color: "#14b8a6" }
];

export default function LandingPage() {
  const { startStream, streamLogs, currentStatus, percentProgress } = useDiagnosticStream();
  const isScanning = useAppStore((state) => state.isScanning);
  
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(null);
  const [activeReport, setActiveReport] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // 1. Fetch initial demo data and recent scans on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        const safeFetch = async (url: string) => {
          try {
            const res = await fetch(url);
            if (res.ok) return await res.json();
          } catch (e) {
            console.warn(`safeFetch failed for ${url}:`, e);
          }
          return null;
        };

        const scans = await safeFetch(
          `${apiBase}/api/v1/scans/recent`
        );

        if (
          scans &&
          scans.length > 0
        ) {
          setRecentScans(
            scans
          );

          const latestScan =
            scans[0];

          const report =
            await safeFetch(
              `${apiBase}/api/v1/scan/${latestScan.id}`
            );

          if (report) {
            setActiveReport(
              report
            );
          }
        } else {
          // Robust local simulated fallback report in case backend is offline/empty
          const fallbackDemo = {
            id: "demo",
            overall_score: 88,
            seo_score: 92,
            performance_score: 84,
            security_score: 75,
            accessibility_score: 95,
            technology_score: 90,
            technology: ["Next.js", "React", "Three.js", "Tailwind CSS", "Vercel"],
            issues: [
              "Strict-Transport-Security (HSTS) header is missing",
              "Content-Security-Policy (CSP) is not configured",
              "Missing image alt tags detected (4 items)",
              "Speed Index score below optimum: 2.2s"
            ],
            recommendations: [
              "Enable Strict-Transport-Security (HSTS) header within server settings",
              "Deploy a robust script-loading Content-Security-Policy (CSP)",
              "Inject meaningful alt tag descriptors to all local images",
              "Optimize and compress large raster static image payloads"
            ],
            seo_details: {
              title: "WebDoctor AI - Real-time Website Diagnostics",
              title_length: 44,
              meta_description: "Audit and optimize website performance, security, and SEO health dynamically.",
              has_sitemap: true,
              has_robots: true,
              images_total: 12,
              images_without_alt: 4
            },
            performance_details: {
              response_time_ms: 180,
              ttfb_ms: 95,
              page_size_kb: 480,
              largest_contentful_paint_s: 1.4,
              speed_index_s: 2.2,
              total_blocking_time_ms: 110
            },
            security_details: {
              https_enabled: true,
              hsts_enabled: false,
              csp_enabled: false,
              referrer_policy: "same-origin",
              x_frame_options: "SAMEORIGIN",
              missing_headers: ["Strict-Transport-Security", "Content-Security-Policy"]
            },
            accessibility_details: {
              score: 95,
              html_lang_present: true,
              aria_labels_present: true,
              missing_alt_tags: 4
            },
            domain_details: {
              registrar: "Vercel Registrar Inc",
              domain_age_days: 340,
              creation_date: "2025-06-20"
            },
            created_at: new Date().toISOString()
          };
          setActiveReport(fallbackDemo);
        }
      } catch (err) {
        console.warn("Could not reach backend APIs, using high-fidelity local simulator:", err);
      }
    };
 
    initData();
  }, []);
 
  // 2. Trigger Active Scan via SSE Stream
  const handleScanSubmit = (url: string) => {
    setActiveModuleIndex(null); // Reset focus
    
    // Initiate stream hook
    startStream(url);
 
    // Watch for completed scan and load its data dynamically
    const pollInterval = setInterval(async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const recentRes = await fetch(`${apiBase}/api/v1/scans/recent`);
        if (recentRes.ok) {
          const scans = await recentRes.json();
          setRecentScans(scans);
          
          // Match matching domain scan to display newly fetched data (case-insensitively)
          const cleanUrl = url.replace(/https?:\/\//i, "").toLowerCase();
          const latestScan = scans.find((s: any) => s.url?.toLowerCase().includes(cleanUrl));
          if (latestScan) {
            const reportRes = await fetch(`${apiBase}/api/v1/scan/${latestScan.id}`);
            if (reportRes.ok) {
              const fullReport = await reportRes.json();
              setActiveReport(fullReport);
              clearInterval(pollInterval);
            }
          }
        }
      } catch (err) {
        // Safe check
      }
    }, 2000);

    // Auto clear poll after 15s safety limit
    setTimeout(() => clearInterval(pollInterval), 15000);
  };

  const handleHistoricalSelect = async (scanId: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const reportRes = await fetch(`${apiBase}/api/v1/scan/${scanId}`);
      if (reportRes.ok) {
        const fullReport = await reportRes.json();
        setActiveReport(fullReport);
        setActiveModuleIndex(0); // Focus on main health node
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-[500vh] w-full text-slate-100 selection:bg-cyan-500/20 select-none overflow-x-hidden">
      
      {/* Viewport fixed background canvas */}
      <div className="fixed inset-0 w-full h-screen z-0 bg-[#020408]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06)_0%,transparent_80%)] pointer-events-none" />
        
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
        >
          {/* Spatial lighting setup */}
          <ambientLight intensity={1.5} />
          <pointLight position={[5, 10, 5]} intensity={2.0} color="#7c3aed" />
          <pointLight position={[-5, -10, -5]} intensity={1.5} color="#06b6d4" />
          <directionalLight position={[0, 4, 1]} intensity={1.0} />

          {/* Interactive Core Piece */}
          <AICore isScanning={isScanning} percentProgress={percentProgress} />

          {/* Render 8 Spatial Orbital Modules connected to real audit categories */}
          {activeReport && MODULE_POSITIONS.map((pos, index) => {
            const moduleInfo = MODULE_LABELS[index];
            const getScore = () => {
              switch (index) {
                case 0: return `${activeReport.overall_score}%`;
                case 1: return `${activeReport.seo_score}%`;
                case 2: return `${activeReport.security_score}%`;
                case 3: return `${activeReport.performance_score}%`;
                case 4: return `${activeReport.accessibility_score}%`;
                case 5: return `${activeReport.recommendations?.length || 0} FIXES`;
                case 6: return `${activeReport.technology?.length || 0} TECHS`;
                case 7: return "LIVE";
                default: return "OK";
              }
            };

            return (
              <OrbitalModuleNode
                key={index}
                position={pos}
                label={moduleInfo.name}
                score={getScore()}
                color={moduleInfo.color}
                isActive={activeModuleIndex === index}
                onClick={() => setActiveModuleIndex(activeModuleIndex === index ? null : index)}
              />
            );
          })}

          {/* GSAP & Scroll-Trigger Spatial Camera rig controller */}
          <SpatialCameraRig
            activeModuleIndex={activeModuleIndex}
            modulePositions={MODULE_POSITIONS}
          />
        </Canvas>
      </div>

      {/* Holographic Header HUD branding */}
      <header className="fixed top-0 inset-x-0 z-30 p-6 flex justify-between items-center select-none pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => setActiveModuleIndex(null)}>
          <div className="relative w-8 h-8 flex items-center justify-center pointer-events-none select-none">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L28 7v7c0 7.5-5.5 12.5-12 16C9.5 26.5 4 21.5 4 14V7L16 2z" fill="#030712" stroke="url(#header-cyan)" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M11 16h3.5l1.5-4 1.5 8 1-4H21" stroke="url(#header-pulse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="header-cyan" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22d3ee"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
                <linearGradient id="header-pulse" x1="11" y1="12" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#a78bfa"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="text-xs uppercase font-black tracking-[0.3em] text-slate-100 font-heading">WebDoctor AI</h1>
            <span className="text-[7px] font-mono text-cyan-400/70 tracking-widest uppercase">System: Diagnostics Node</span>
          </div>
        </div>

        {/* Small floating HUD displaying domain details */}
        {activeReport && activeReport.url && (
          <div className="bg-black/45 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-900 flex items-center gap-4 text-[9px] font-mono text-slate-400">
            <div>
              <span className="text-[7px] text-slate-500 block uppercase">Host</span>
              <span className="text-cyan-300 font-bold uppercase">{activeReport.url?.replace(/https?:\/\//, "")}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-900" />
            <div>
              <span className="text-[7px] text-slate-500 block uppercase">Aggregate Grade</span>
              <span className="text-emerald-400 font-bold uppercase">{activeReport.overall_score}%</span>
            </div>
          </div>
        )}
      </header>

      {/* Scroll indicator overlay */}
      {activeModuleIndex === null && !isScanning && (
        <div className="fixed top-[45%] left-10 z-30 flex flex-col gap-3.5 font-mono text-[9px] text-slate-500 uppercase tracking-widest leading-4 animate-pulse select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Scroll vertically to traverse coordinates</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span>Click orbiting nodes to query details</span>
          </div>
        </div>
      )}

      {/* Trailing coordinate historical reports (Floating Background Star-field shortcuts) */}
      {recentScans.length > 0 && activeModuleIndex === null && (
        <div className="fixed top-24 left-6 z-20 space-y-2 pointer-events-auto">
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Historical Logs Star-field:</div>
          <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
            {recentScans.map((scan: any, idx: number) => (
              <button
                key={idx}
                onClick={() => handleHistoricalSelect(scan.id)}
                className="bg-black/55 backdrop-blur-md px-3 py-1.5 rounded border border-slate-900 hover:border-cyan-500/30 text-left text-[9px] font-mono hover:text-cyan-300 transition-colors uppercase"
              >
                &gt; {scan.url?.replace(/https?:\/\//, "").slice(0, 16) || "UNKNOWN"}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Holographic detail view HUD overlay */}
      <HolographicHUD
        activeModuleIndex={activeModuleIndex}
        report={activeReport}
        onClose={() => setActiveModuleIndex(null)}
      />

      {/* Neural url input and SSE crawlers logging console dock */}
      <NeuralInputDock
        onScanSubmit={handleScanSubmit}
        isScanning={isScanning}
        percentProgress={percentProgress}
        currentStatus={currentStatus}
        streamLogs={streamLogs}
      />
    </div>
  );
}
