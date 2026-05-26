import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function useDiagnosticStream() {
  const { setScanning, setScanStep, addNotification } = useAppStore();
  const [streamLogs, setStreamLogs] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState("");
  const [percentProgress, setPercentProgress] = useState(0);

  const startStream = (url: string) => {
    setScanning(true);
    setStreamLogs([]);
    setCurrentStatus("Initializing crawl stream...");
    setPercentProgress(5);

    const cleanUrl = encodeURIComponent(url.replace(/https?:\/\//, ""));
    const eventSource = new EventSource(`/api/diagnostics/stream?url=${cleanUrl}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          addNotification(data.error, "error");
          eventSource.close();
          setScanning(false);
          return;
        }

        if (data.status) {
          setCurrentStatus(data.status);
        }
        if (data.progress) {
          setPercentProgress(data.progress);
        }
        if (data.step !== undefined) {
          setScanStep(data.step);
        }
        if (data.logs) {
          setStreamLogs((prev) => [...prev, data.logs]);
        }

        if (data.completed) {
          eventSource.close();
          addNotification("Website health scan completed successfully!", "success");
          
          setTimeout(() => {
            setScanning(false);
          }, 1200);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      addNotification("Disconnected from diagnostic stream. Falling back...", "warning");
      eventSource.close();
      
      // Fallback transition after 4s
      setTimeout(() => {
        setScanning(false);
      }, 4000);
    };

    return () => {
      eventSource.close();
    };
  };

  return {
    startStream,
    streamLogs,
    currentStatus,
    percentProgress,
  };
}
