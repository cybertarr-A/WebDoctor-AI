"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Zap, Search, Globe, ChevronRight } from "lucide-react";

interface NeuralInputDockProps {
  onScanSubmit: (url: string) => void;
  isScanning: boolean;
  percentProgress: number;
  currentStatus: string;
  streamLogs: string[];
}

export default function NeuralInputDock({
  onScanSubmit,
  isScanning,
  percentProgress,
  currentStatus,
  streamLogs
}: NeuralInputDockProps) {
  const [url, setUrl] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs to bottom as they print
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onScanSubmit(url);
  };

  const handleQuickScan = (quickUrl: string) => {
    setUrl(quickUrl);
    onScanSubmit(quickUrl);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 select-none pointer-events-auto">
      <motion.div 
        layout
        className="glass-panel border border-cyan-500/25 bg-black/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.12)] overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!isScanning ? (
            // STANDBY STATE: Clean URL input card
            <motion.form
              key="standby"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleSubmit}
              className="p-4 flex flex-col md:flex-row items-center gap-3"
            >
              <div className="relative flex-1 w-full">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-cyan-400">
                  <Terminal className="w-4 h-4 animate-pulse" />
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-60">AUDIT_NODE:</span>
                </div>
                <input
                  type="text"
                  placeholder="E.G., HTTPS://GOOGLE.COM"
                  value={url}
                  onChange={(e) => setUrl(e.target.value.toUpperCase())}
                  className="w-full pl-36 pr-4 py-3 bg-slate-950/70 border border-slate-900 rounded-xl text-xs font-mono font-bold tracking-widest text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 transform active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-cyan-400/20"
              >
                INITIATE WAVE <ChevronRight className="w-4 h-4" />
              </button>
            </motion.form>
          ) : (
            // ACTIVE WAVE STATE: Circular loading + scrolling SSE diagnostics console
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-5 space-y-4"
            >
              {/* Radial telemetry bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-heading">Active Diagnostics Wave</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{currentStatus}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-mono text-cyan-400">{percentProgress}%</span>
                  <span className="text-[8px] font-mono text-slate-500 block uppercase">CORES_ENGAGED</span>
                </div>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900/60">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-violet-600"
                  animate={{ width: `${percentProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Real-time scrolling diagnostics logs */}
              <div className="h-28 bg-slate-950/90 rounded-xl border border-slate-900/80 p-3 overflow-y-auto font-mono text-[9px] text-cyan-300/85 space-y-1.5 scrollbar-thin">
                {streamLogs.map((log, index) => (
                  <div key={index} className="flex gap-2 items-start leading-4">
                    <span className="text-slate-600 select-none">[{index.toString().padStart(2, "0")}]</span>
                    <span className="text-cyan-400/90 font-semibold select-none">&gt;&gt;</span>
                    <span className="break-all">{log}</span>
                  </div>
                ))}
                {streamLogs.length === 0 && (
                  <div className="text-slate-600 animate-pulse">&gt;&gt; ESTABLISHING NEURAL AUDIT GATEWAYS...</div>
                )}
                <div ref={terminalEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick shortcuts */}
      {!isScanning && (
        <div className="flex justify-center gap-4 mt-3 text-[8px] font-mono text-slate-500 uppercase select-none">
          <span>Quick Wave Injections:</span>
          <button onClick={() => handleQuickScan("google.com")} className="hover:text-cyan-400 transition-colors">GOOGLE.COM</button>
          <button onClick={() => handleQuickScan("github.com")} className="hover:text-cyan-400 transition-colors">GITHUB.COM</button>
          <button onClick={() => handleQuickScan("vercel.app")} className="hover:text-cyan-400 transition-colors">VERCEL.APP</button>
        </div>
      )}
    </div>
  );
}
