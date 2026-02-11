"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Data sources sub-tabs
export type DataSourcesTab =
  | "sources-files"
  | "sources-text-snippets"
  | "sources-website"
  | "sources-qa"
  | "sources-integrations";

export type DashboardTab = 
  | "playground"
  | "activity"
  | "analytics"
  | DataSourcesTab
  | "actions"
  | "deploy"
  | "theme"
  | "agent-settings";

// Helper to check if a tab is a data sources tab
export function isDataSourcesTab(tab: DashboardTab): tab is DataSourcesTab {
  return tab.startsWith("sources-");
}

// Data sources tab info for dropdowns/menus
export const dataSourcesTabs: { key: DataSourcesTab; title: string; icon: string }[] = [
  { key: "sources-files", title: "Files", icon: "solar:file-text-linear" },
  { key: "sources-text-snippets", title: "Text Snippets", icon: "solar:document-text-linear" },
  { key: "sources-website", title: "Website", icon: "solar:global-linear" },
  { key: "sources-qa", title: "Q&A", icon: "solar:chat-square-like-linear" },
  { key: "sources-integrations", title: "Integrations", icon: "solar:widget-linear" },
];

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
