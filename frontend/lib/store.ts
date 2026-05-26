import { create } from "zustand";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number;
}

interface AppState {
  activeScanUrl: string;
  isScanning: boolean;
  scanStep: number;
  scanReport: any | null;
  chatMessages: ChatMessage[];
  notifications: AppNotification[];
  
  // Actions
  setActiveScanUrl: (url: string) => void;
  setScanning: (isScanning: boolean) => void;
  setScanStep: (step: number) => void;
  setScanReport: (report: any | null) => void;
  addChatMessage: (text: string, sender: "user" | "ai") => void;
  clearChat: () => void;
  addNotification: (message: string, type: AppNotification["type"]) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeScanUrl: "",
  isScanning: false,
  scanStep: 0,
  scanReport: null,
  chatMessages: [],
  notifications: [],

  setActiveScanUrl: (url) => set({ activeScanUrl: url }),
  setScanning: (isScanning) => set((state) => ({ 
    isScanning,
    scanStep: isScanning ? 0 : state.scanStep,
    chatMessages: isScanning ? [] : state.chatMessages // reset chat when new scan starts
  })),
  setScanStep: (scanStep) => set({ scanStep }),
  setScanReport: (scanReport) => set({ scanReport }),
  
  addChatMessage: (text, sender) => set((state) => ({
    chatMessages: [
      ...state.chatMessages,
      {
        id: Math.random().toString(36).substr(2, 9),
        sender,
        text,
        timestamp: new Date().toLocaleTimeString(),
      }
    ]
  })),
  clearChat: () => set({ chatMessages: [] }),
  
  addNotification: (message, type) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    
    // Auto-remove notification after 4 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
    }, 4000);
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),
}));
