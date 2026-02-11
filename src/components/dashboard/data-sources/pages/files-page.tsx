"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Progress,
  Divider,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// Mock data - replace with real data from API
const MOCK_DATA = {
  totalLinks: 3304,
  totalSizeKB: 867,
  maxSizeKB: 400,
  files: [] as { name: string; size: number }[],
};

export default function FilesPage() {
  const [isAddFilesOpen, setIsAddFilesOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const { totalLinks, totalSizeKB, maxSizeKB } = MOCK_DATA;
  const usagePercent = Math.min((totalSizeKB / maxSizeKB) * 100, 100);
  const isLimitExceeded = totalSizeKB > maxSizeKB;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop - to be implemented
  };

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      {/* Header - Full Width */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Files</h1>
          <p className="text-sm text-default-500">
            Upload documents to train your AI. Extract text from PDFs, DOCX, and TXT files.
          </p>
        </div>
        <Button
          variant="bordered"
          size="sm"
          startContent={<Icon icon="solar:info-circle-linear" width={16} />}
        >
          Learn more
        </Button>
      </div>

      {/* Content Area - Two Columns */}
      <div className="mt-6 flex flex-1 gap-6">
        {/* Left Column - Add Files Section */}
        <div className="flex flex-1 flex-col rounded-lg border border-divider">
          {/* Collapsible Header */}
          <button
            onClick={() => setIsAddFilesOpen(!isAddFilesOpen)}
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-default-50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Add files</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              width={16}
              className={cn(
                "text-default-400 transition-transform",
                isAddFilesOpen && "rotate-180"
              )}
            />
          </button>

          {isAddFilesOpen && (
            <div className="flex flex-1 flex-col px-4 pb-4">
              {/* Warning Alert */}
              {isLimitExceeded && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning-50 px-3 py-2 text-warning-600">
                  <Icon icon="solar:danger-circle-linear" width={16} />
                  <span className="text-sm">
                    Upgrade your plan to add more files.
                  </span>
                </div>
              )}

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                  isDragging
                    ? "border-primary bg-primary-50"
                    : "border-default-200 bg-default-50",
                  isLimitExceeded && "opacity-60 pointer-events-none"
                )}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="rounded-full bg-default-100 p-3">
                    <Icon
                      icon="solar:upload-minimalistic-linear"
                      width={24}
                      className="text-default-400"
                    />
                  </div>
                  {isLimitExceeded ? (
                    <p className="text-sm text-default-400">
                      Storage limit reached. Please upgrade your plan.
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-default-600">
                          Drag and drop files here, or{" "}
                          <button className="text-primary hover:underline">
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-default-400">
                          Supports PDF, DOCX, TXT files up to 10MB each
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="flex h-full w-[340px] flex-shrink-0">
          <Card className="h-full w-full border border-divider shadow-none">
            <CardBody className="gap-4 p-4">
              {/* Header */}
              <h2 className="text-sm font-semibold text-foreground">Data sources</h2>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:global-linear" width={16} className="text-default-400" />
                  <span className="text-sm text-default-600">{totalLinks.toLocaleString()} Links</span>
                </div>
                <span className="text-sm text-default-500">{totalSizeKB} KB</span>
              </div>

              <Divider />

              {/* Usage */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-default-600">Total size</span>
                  <span className="text-sm text-default-500">
                    {totalSizeKB} KB / {maxSizeKB} KB
                  </span>
                </div>
                <Progress
                  value={usagePercent}
                  size="sm"
                  color={isLimitExceeded ? "danger" : "primary"}
                  classNames={{
                    track: "h-2",
                    indicator: isLimitExceeded ? "bg-danger" : "",
                  }}
                />
              </div>

              {/* Retrain Button */}
              <Button
                color="default"
                variant="solid"
                className="w-full bg-default-800 text-white hover:bg-default-700"
              >
                Retrain agent
              </Button>

              {/* Limit Warning */}
              {isLimitExceeded && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-danger" />
                    <span className="text-sm font-medium text-danger">Limit exceeded</span>
                  </div>
                  <p className="text-xs text-default-500">
                    You&apos;re using {totalSizeKB} KB of {maxSizeKB} KB included in your plan
                  </p>
                </div>
              )}

              {/* Upgrade Link */}
              <button className="flex items-center justify-between rounded-lg border border-warning-200 bg-warning-50 px-3 py-2.5 text-left transition-colors hover:bg-warning-100">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:info-circle-linear" width={16} className="text-warning-600" />
                  <span className="text-sm text-default-700">Upgrade to train on more data</span>
                </div>
                <Icon icon="solar:alt-arrow-right-linear" width={16} className="text-default-400" />
              </button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
