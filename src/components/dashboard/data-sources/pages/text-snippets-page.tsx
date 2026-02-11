"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Progress,
  Divider,
  Input,
  Tooltip,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// Mock data - replace with real data from API
const MOCK_DATA = {
  totalLinks: 3304,
  totalSizeKB: 867,
  maxSizeKB: 400,
};

export default function TextSnippetsPage() {
  const [isAddSnippetOpen, setIsAddSnippetOpen] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { totalLinks, totalSizeKB, maxSizeKB } = MOCK_DATA;
  const usagePercent = Math.min((totalSizeKB / maxSizeKB) * 100, 100);
  const isLimitExceeded = totalSizeKB > maxSizeKB;

  // Calculate content size in bytes
  const contentSize = new Blob([content]).size;
  const formattedSize = contentSize >= 1024 
    ? `${(contentSize / 1024).toFixed(1)} KB` 
    : `${contentSize} B`;

  const toolbarButtons = [
    { icon: "solar:text-field-linear", tooltip: "Font", hasDropdown: true },
    { icon: "solar:text-bold-linear", tooltip: "Bold" },
    { icon: "solar:text-italic-linear", tooltip: "Italic" },
    { icon: "solar:text-strikethrough-linear", tooltip: "Strikethrough" },
    { type: "divider" },
    { icon: "solar:list-linear", tooltip: "Ordered list" },
    { icon: "solar:list-check-linear", tooltip: "Unordered list" },
    { type: "divider" },
    { icon: "solar:link-linear", tooltip: "Link" },
    { icon: "solar:smile-circle-linear", tooltip: "Emoji" },
  ];

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      {/* Header - Full Width */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Text snippets</h1>
          <p className="text-sm text-default-500">
            Add text snippets to your knowledge base that the agent gets trained on.
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
        {/* Left Column - Add Text Snippet Section */}
        <div className="flex flex-1 flex-col rounded-lg border border-divider">
          {/* Collapsible Header */}
          <button
            onClick={() => setIsAddSnippetOpen(!isAddSnippetOpen)}
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-default-50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Add text snippet</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              width={16}
              className={cn(
                "text-default-400 transition-transform",
                isAddSnippetOpen && "rotate-180"
              )}
            />
          </button>

          {isAddSnippetOpen && (
            <div className="flex flex-1 flex-col px-4 pb-4">
              {/* Title Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-default-600">Title</label>
                <Input
                  placeholder="Ex: Refund requests"
                  value={title}
                  onValueChange={setTitle}
                  variant="bordered"
                  size="sm"
                  classNames={{
                    inputWrapper: "bg-transparent",
                  }}
                />
              </div>

              {/* Rich Text Editor */}
              <div className="mt-4 flex flex-1 flex-col rounded-lg border border-default-200">
                {/* Toolbar */}
                <div className="flex items-center justify-between border-b border-default-200 px-2 py-1.5">
                  <div className="flex items-center gap-0.5">
                    {toolbarButtons.map((btn, index) => {
                      if (btn.type === "divider") {
                        return (
                          <div
                            key={`divider-${index}`}
                            className="mx-1 h-5 w-px bg-default-200"
                          />
                        );
                      }
                      return (
                        <Tooltip key={btn.icon} content={btn.tooltip} size="sm">
                          <button
                            className="flex items-center gap-0.5 rounded p-1.5 text-default-500 hover:bg-default-100 hover:text-default-700 transition-colors"
                          >
                            <Icon icon={btn.icon!} width={16} />
                            {btn.hasDropdown && (
                              <Icon icon="solar:alt-arrow-down-linear" width={12} />
                            )}
                          </button>
                        </Tooltip>
                      );
                    })}
                  </div>
                  <span className="text-xs text-default-400">{formattedSize}</span>
                </div>

                {/* Text Area */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your text snippet content..."
                  className="flex-1 resize-none bg-transparent p-3 text-sm text-foreground placeholder:text-default-300 focus:outline-none"
                />

                {/* Footer with Add Button */}
                <div className="flex justify-end border-t border-default-200 px-3 py-2">
                  <Button
                    color="default"
                    variant="solid"
                    size="sm"
                    className="bg-default-800 text-white hover:bg-default-700"
                    isDisabled={!title.trim() || !content.trim() || isLimitExceeded}
                  >
                    Add text snippet
                  </Button>
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
