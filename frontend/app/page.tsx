"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useAppStore } from "@/lib/store";
import { useDiagnosticStream } from "@/hooks/useDiagnosticStream";

import AICore from "@/components/3d/AICore";
import OrbitalModuleNode from "@/components/3d/OrbitalModuleNode";
import SpatialCameraRig from "@/components/3d/SpatialCameraRig";
import HolographicHUD from "@/components/ui/HolographicHUD";
import NeuralInputDock from "@/components/ui/NeuralInputDock";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  console.error(
    "❌ NEXT_PUBLIC_API_URL missing. Configure it in Vercel."
  );
}

const MODULE_POSITIONS: [number, number, number][] = [
  [2.4, 0.8, 1.2],
  [-2.2, 1.5, -0.6],
  [2.1, -1.6, 0.8],
  [-2.0, -1.0, 1.4],
  [0.8, 2.3, -0.8],
  [1.4, -2.2, -1.2],
  [-2.6, 0.3, 1.6],
  [-0.6, -2.5, -0.5]
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

  const { startStream, streamLogs, currentStatus, percentProgress } =
    useDiagnosticStream();

  const isScanning =
    useAppStore((state) => state.isScanning);

  const [activeModuleIndex, setActiveModuleIndex] =
    useState<number | null>(null);

  const [activeReport, setActiveReport] =
    useState<any>(null);

  const [recentScans, setRecentScans] =
    useState<any[]>([]);


  async function safeFetch(url: string) {

    try {

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `API Error ${response.status}`
        );
      }

      return await response.json();

    } catch (err) {

      console.error(
        `❌ Request failed: ${url}`,
        err
      );

      return null;
    }
  }


  useEffect(() => {

    const initData = async () => {

      if (!API_BASE) return;

      const scans = await safeFetch(
        `${API_BASE}/api/v1/scans/recent`
      );

      if (scans) {
        setRecentScans(scans);
      }

      const demo = await safeFetch(
        `${API_BASE}/api/v1/scan/demo`
      );

      if (demo) {
        setActiveReport(demo);
      }
    };

    initData();

  }, []);


  const handleScanSubmit = async (
    url: string
  ) => {

    if (!API_BASE) return;

    setActiveModuleIndex(null);

    startStream(url);

    const interval = setInterval(
      async () => {

        const scans =
          await safeFetch(
            `${API_BASE}/api/v1/scans/recent`
          );

        if (!scans) return;

        setRecentScans(scans);

        const cleanUrl =
          url
          .replace(
            /https?:\/\//i,
            ""
          )
          .toLowerCase();

        const latest =
          scans.find(
            (scan: any) =>
              scan.url
              ?.toLowerCase()
              .includes(cleanUrl)
          );

        if (latest) {

          const report =
            await safeFetch(
              `${API_BASE}/api/v1/scan/${latest.id}`
            );

          if (report) {

            setActiveReport(
              report
            );

            clearInterval(
              interval
            );
          }
        }

      },
      2000
    );

    setTimeout(
      () => clearInterval(interval),
      15000
    );
  };


  const handleHistoricalSelect =
    async (
      scanId: string
    ) => {

      if (!API_BASE) return;

      const report =
        await safeFetch(
          `${API_BASE}/api/v1/scan/${scanId}`
        );

      if (report) {

        setActiveReport(
          report
        );

        setActiveModuleIndex(
          0
        );
      }
    };


  return (

    <div className="relative min-h-screen w-full">

      <Canvas
        camera={{
          position:[0,0,8],
          fov:50
        }}
      >

        <ambientLight intensity={1.5} />

        <AICore
          isScanning={isScanning}
          percentProgress={percentProgress}
        />

        {
          activeReport &&
          MODULE_POSITIONS.map(
            (
              pos,
              index
            ) => (

              <OrbitalModuleNode
                key={index}
                position={pos}
                label={
                  MODULE_LABELS[index].name
                }
                color={
                  MODULE_LABELS[index].color
                }
                isActive={
                  activeModuleIndex===index
                }
                score={"OK"}
                onClick={() =>
                  setActiveModuleIndex(
                    activeModuleIndex===index
                    ? null
                    : index
                  )
                }
              />

            )
          )
        }

        <SpatialCameraRig
          activeModuleIndex={
            activeModuleIndex
          }
          modulePositions={
            MODULE_POSITIONS
          }
        />

      </Canvas>

      <HolographicHUD
        activeModuleIndex={
          activeModuleIndex
        }
        report={activeReport}
        onClose={() =>
          setActiveModuleIndex(
            null
          )
        }
      />

      <NeuralInputDock
        onScanSubmit={
          handleScanSubmit
        }
        isScanning={
          isScanning
        }
        percentProgress={
          percentProgress
        }
        currentStatus={
          currentStatus
        }
        streamLogs={
          streamLogs
        }
      />

    </div>
  );
}