"use client";

import React from "react";
import SessionsChart from "./sessions-chart";

export default function ActivityPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Activity</h1>
        <p className="text-default-500">
          Monitor your chatbot's performance and engagement metrics
        </p>
      </div>

      {/* Main Grid - 4 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sessions Chart - takes 3 columns */}
        <div className="lg:col-span-3">
          <SessionsChart />
        </div>

        {/* Placeholder for donut chart - takes 1 column */}
        <div className="lg:col-span-1">
          <div className="h-full min-h-[300px] rounded-large border border-dashed border-default-300 flex items-center justify-center">
            <p className="text-default-400 text-sm">Donut chart coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
