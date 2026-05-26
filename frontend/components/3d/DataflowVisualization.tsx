"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  label: string;
  color: string;
  glow: string;
}

interface Particle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  speed: number;
  color: string;
}

export default function DataflowVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialize 5 distinct engine nodes
    const nodes: Node[] = [
      { x: 0.15, y: 0.5, label: "Client Request", color: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)" },
      { x: 0.35, y: 0.25, label: "SSL Handshake", color: "#10b981", glow: "rgba(16, 185, 129, 0.4)" },
      { x: 0.55, y: 0.75, label: "Header security", color: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" },
      { x: 0.75, y: 0.3, label: "Perf latency", color: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)" },
      { x: 0.9, y: 0.5, label: "AI Recommendations", color: "#7c3aed", glow: "rgba(124, 88, 237, 0.4)" }
    ];

    let particles: Particle[] = [];

    const spawnParticle = () => {
      // Spawn packet moving along consecutive nodes
      const nodeIndex = Math.floor(Math.random() * (nodes.length - 1));
      const start = nodes[nodeIndex];
      const end = nodes[nodeIndex + 1];

      particles.push({
        startX: start.x * width,
        startY: start.y * height,
        endX: end.x * width,
        endY: end.y * height,
        progress: 0,
        speed: 0.008 + Math.random() * 0.006,
        color: start.color
      });
    };

    // Spawning interval
    const spawnInterval = setInterval(spawnParticle, 600);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines
      ctx.beginPath();
      ctx.strokeStyle = "rgba(124, 58, 237, 0.08)";
      ctx.lineWidth = 2.5;
      
      for (let i = 0; i < nodes.length - 1; i++) {
        const from = nodes[i];
        const to = nodes[i + 1];
        ctx.moveTo(from.x * width, from.y * height);
        ctx.lineTo(to.x * width, to.y * height);
      }
      ctx.stroke();

      // Update and draw packets
      particles.forEach((p, idx) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          particles.splice(idx, 1);
          return;
        }

        const currentX = p.startX + (p.endX - p.startX) * p.progress;
        const currentY = p.startY + (p.endY - p.startY) * p.progress;

        // Draw glowing particle dot
        ctx.beginPath();
        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw module nodes
      nodes.forEach((node) => {
        const x = node.x * width;
        const y = node.y * height;

        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = node.glow;
        ctx.fill();

        // Inner solid core
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Label
        ctx.font = "bold 9px Sora";
        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.textAlign = "center";
        ctx.fillText(node.label, x, y + 25);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawnInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="w-full h-44 relative bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 overflow-hidden shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
