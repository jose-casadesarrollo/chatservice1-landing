"use client";

import { useDashboardTab } from "@/contexts/dashboard-tab-context";
import ThemePlayground from "@/components/dashboard/theme-playground";
import {
  FilesPage,
  TextSnippetsPage,
  WebsitePage,
  QAPage,
  IntegrationsPage,
} from "@/components/dashboard/data-sources";
import { DeployPage } from "@/components/dashboard/deploy";
import { ActivityPage } from "@/components/dashboard/activity";

export default function DashboardPage() {
  const { activeTab } = useDashboardTab();

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "playground":
        return <ThemePlayground />;
      case "theme":
        return <ThemePlayground />;
      case "activity":
        return (
          <div className="h-full overflow-auto p-6">
            <ActivityPage />
          </div>
        );
      case "deploy":
        return (
          <div className="h-full overflow-auto p-6">
            <DeployPage />
          </div>
        );
      // Data Sources pages
      case "sources-files":
        return (
          <div className="h-full overflow-auto p-6">
            <FilesPage />
          </div>
        );
      case "sources-text-snippets":
        return (
          <div className="h-full overflow-auto p-6">
            <TextSnippetsPage />
          </div>
        );
      case "sources-website":
        return (
          <div className="h-full overflow-auto p-6">
            <WebsitePage />
          </div>
        );
      case "sources-qa":
        return (
          <div className="h-full overflow-auto p-6">
            <QAPage />
          </div>
        );
      case "sources-integrations":
        return (
          <div className="h-full overflow-auto p-6">
            <IntegrationsPage />
          </div>
        );
      default:
        return (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-foreground capitalize">
                {activeTab.replace("-", " ")}
              </h1>
              <p className="mt-2 text-default-500">Content coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return renderContent();
}
