"use client";

import { useDashboardTab } from "@/contexts/dashboard-tab-context";
import ThemePlayground from "@/components/dashboard/theme-playground";

export default function DashboardPage() {
  const { activeTab } = useDashboardTab();

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "playground":
        return <ThemePlayground />;
      case "theme":
        return <ThemePlayground />;
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
