"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Progress,
  Divider,
  Input,
  Tabs,
  Tab,
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// Mock data - replace with real data from API
const MOCK_DATA = {
  totalLinks: 3304,
  totalSizeKB: 867,
  maxSizeKB: 400,
  linkSources: [
    {
      id: "1",
      url: "https://coca-cola.com",
      lastCrawled: "1 day ago",
      linksCount: 3304,
    },
  ],
};

type AddLinksTab = "crawl" | "sitemap" | "individual";

export default function WebsitePage() {
  const [isAddLinksOpen, setIsAddLinksOpen] = useState(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AddLinksTab>("crawl");
  const [protocol, setProtocol] = useState("https://");
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const { totalLinks, totalSizeKB, maxSizeKB, linkSources } = MOCK_DATA;
  const usagePercent = Math.min((totalSizeKB / maxSizeKB) * 100, 100);
  const isLimitExceeded = totalSizeKB > maxSizeKB;

  const allSelected = selectedSources.length === linkSources.length && linkSources.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedSources([]);
    } else {
      setSelectedSources(linkSources.map((s) => s.id));
    }
  };

  const toggleSource = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      {/* Header - Full Width */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">Website</h1>
          <p className="text-sm text-default-500">
            Crawl web pages or submit sitemaps to update your AI with the latest content.
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
      <div className="mt-6 flex flex-1 gap-6 overflow-hidden">
        {/* Left Column - Main Content */}
        <div className="flex flex-1 flex-col gap-4 overflow-auto">
          {/* Add Links Section */}
          <div className="flex flex-col rounded-lg border border-divider">
            {/* Collapsible Header */}
            <button
              onClick={() => setIsAddLinksOpen(!isAddLinksOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-default-50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">Add links</span>
              <Icon
                icon="solar:alt-arrow-down-linear"
                width={16}
                className={cn(
                  "text-default-400 transition-transform",
                  isAddLinksOpen && "rotate-180"
                )}
              />
            </button>

            {isAddLinksOpen && (
              <div className="flex flex-col px-4 pb-4">
                {/* Tabs */}
                <Tabs
                  aria-label="Add links options"
                  selectedKey={activeTab}
                  onSelectionChange={(key) => setActiveTab(key as AddLinksTab)}
                  variant="underlined"
                  classNames={{
                    tabList: "gap-4 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-foreground",
                    tab: "max-w-fit px-0 h-10",
                    tabContent: "group-data-[selected=true]:text-foreground text-default-400",
                  }}
                >
                  <Tab key="crawl" title="Crawl links" />
                  <Tab key="sitemap" title="Sitemap" />
                  <Tab key="individual" title="Individual link" />
                </Tabs>

                {/* URL Input */}
                <div className="mt-4 flex flex-col gap-1.5">
                  <label className="text-sm text-default-600">URL</label>
                  <div className="flex">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          variant="bordered"
                          size="sm"
                          className="rounded-r-none border-r-0 min-w-[100px]"
                          endContent={<Icon icon="solar:alt-arrow-down-linear" width={14} />}
                        >
                          {protocol}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Protocol selection"
                        onAction={(key) => setProtocol(key as string)}
                        selectedKeys={[protocol]}
                        selectionMode="single"
                      >
                        <DropdownItem key="https://">https://</DropdownItem>
                        <DropdownItem key="http://">http://</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                    <Input
                      placeholder="www.example.com"
                      value={url}
                      onValueChange={setUrl}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        inputWrapper: "rounded-l-none bg-transparent",
                      }}
                    />
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-default-400">
                    <Icon icon="solar:info-circle-linear" width={14} />
                    Links found during crawling or sitemap retrieval may be updated if new links are discovered or some links are invalid.
                  </p>
                </div>

                {/* Advanced Options */}
                <button
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="mt-4 flex items-center gap-1.5 text-sm text-default-500 hover:text-default-700 transition-colors"
                >
                  <Icon
                    icon="solar:alt-arrow-down-linear"
                    width={14}
                    className={cn(
                      "transition-transform",
                      isAdvancedOpen && "rotate-180"
                    )}
                  />
                  Advanced options
                </button>

                {isAdvancedOpen && (
                  <div className="mt-3 rounded-lg bg-default-50 p-4">
                    <p className="text-sm text-default-400">
                      Advanced crawling options coming soon...
                    </p>
                  </div>
                )}

                {/* Fetch Button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    color="default"
                    variant="solid"
                    size="sm"
                    className="bg-default-800 text-white hover:bg-default-700"
                    isDisabled={!url.trim() || isLimitExceeded}
                  >
                    Fetch links
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Link Sources Section */}
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Link sources</h2>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  variant="bordered"
                  size="sm"
                  startContent={<Icon icon="solar:magnifer-linear" width={16} className="text-default-400" />}
                  classNames={{
                    inputWrapper: "h-8 min-h-8 w-[180px] bg-transparent",
                    input: "text-sm",
                  }}
                />
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="light"
                      size="sm"
                      endContent={<Icon icon="solar:alt-arrow-down-linear" width={14} />}
                      className="text-default-500"
                    >
                      Sort by: Default
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Sort options">
                    <DropdownItem key="default">Default</DropdownItem>
                    <DropdownItem key="name">Name</DropdownItem>
                    <DropdownItem key="date">Date crawled</DropdownItem>
                    <DropdownItem key="links">Links count</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>

            {/* Select All */}
            <div className="flex items-center">
              <Checkbox
                isSelected={allSelected}
                onValueChange={toggleSelectAll}
                size="sm"
              >
                <span className="text-sm text-primary">Select all</span>
              </Checkbox>
            </div>

            {/* Sources List */}
            <div className="flex flex-col">
              {linkSources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between border-b border-divider py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      isSelected={selectedSources.includes(source.id)}
                      onValueChange={() => toggleSource(source.id)}
                      size="sm"
                    />
                    <Icon icon="solar:global-linear" width={18} className="text-default-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{source.url}</span>
                      <span className="text-xs text-default-400">
                        Last crawled {source.lastCrawled} • Links: {source.linksCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          className="text-default-400"
                        >
                          <Icon icon="solar:menu-dots-bold" width={18} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Source actions">
                        <DropdownItem key="recrawl" startContent={<Icon icon="solar:refresh-linear" width={16} />}>
                          Re-crawl
                        </DropdownItem>
                        <DropdownItem key="view" startContent={<Icon icon="solar:eye-linear" width={16} />}>
                          View links
                        </DropdownItem>
                        <DropdownItem key="delete" startContent={<Icon icon="solar:trash-bin-trash-linear" width={16} />} className="text-danger" color="danger">
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                    <Icon icon="solar:alt-arrow-down-linear" width={16} className="text-default-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
