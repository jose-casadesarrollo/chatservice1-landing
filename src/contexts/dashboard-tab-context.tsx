"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type DashboardTab = 
  | "playground"
  | "activity"
  | "analytics"
  | "sources"
  | "actions"
  | "deploy"
  | "theme"
  | "agent-settings";

interface DashboardTabContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

const DashboardTabContext = createContext<DashboardTabContextType | undefined>(undefined);

export function DashboardTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("playground");

  return (
    <DashboardTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </DashboardTabContext.Provider>
  );
}

export function useDashboardTab() {
  const context = useContext(DashboardTabContext);
  if (!context) {
    throw new Error("useDashboardTab must be used within a DashboardTabProvider");
  }
  return context;
}
