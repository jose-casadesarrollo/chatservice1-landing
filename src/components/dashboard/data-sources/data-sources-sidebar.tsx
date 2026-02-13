"use client";

import { useEffect, useState, useCallback } from "react";
import { Button, Card, CardBody, Progress, Divider, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/auth-context";
import { knowledgeBaseApi, type KnowledgeBaseStats } from "@/lib/api-client";

interface DataSourcesSidebarProps {
  onRetrain?: () => void;
  refreshTrigger?: number; // Increment to trigger refresh
}

export default function DataSourcesSidebar({ onRetrain, refreshTrigger }: DataSourcesSidebarProps) {
  const { token } = useAuth();
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await knowledgeBaseApi.getStats(token);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
      console.error("Failed to fetch knowledge base stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]);

  // Calculate usage percentage
  const usagePercent = stats
    ? Math.min((stats.total_documents / stats.max_documents) * 100, 100)
    : 0;
  const isLimitExceeded = stats
    ? stats.total_documents >= stats.max_documents
    : false;

  if (isLoading) {
    return (
      <div className="flex h-full w-[340px] flex-shrink-0">
        <Card className="h-full w-full border border-divider shadow-none">
          <CardBody className="gap-4 p-4">
            <Skeleton className="h-5 w-24 rounded-lg" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
            </div>
            <Divider />
            <Skeleton className="h-2 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-[340px] flex-shrink-0">
        <Card className="h-full w-full border border-divider shadow-none">
          <CardBody className="flex items-center justify-center gap-2 p-4">
            <Icon icon="solar:danger-triangle-linear" width={24} className="text-danger" />
            <p className="text-sm text-danger">{error}</p>
            <Button
              size="sm"
              variant="flat"
              onPress={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full w-[340px] flex-shrink-0">
      <Card className="h-full w-full border border-divider shadow-none">
        <CardBody className="gap-4 p-4">
          {/* Header */}
          <h2 className="text-sm font-semibold text-foreground">Data sources</h2>

          {/* Document Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:documents-linear" width={16} className="text-default-400" />
              <span className="text-sm text-default-600">
                {stats?.total_documents ?? 0} Documents
              </span>
            </div>
            <span className="text-sm text-default-500">
              {stats?.active_documents ?? 0} active
            </span>
          </div>

          {/* Category Breakdown */}
          {stats?.by_category && Object.keys(stats.by_category).length > 0 && (
            <div className="flex flex-col gap-1.5">
              {Object.entries(stats.by_category).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={getCategoryIcon(category)}
                      width={14}
                      className="text-default-400"
                    />
                    <span className="text-xs text-default-500 capitalize">
                      {category}
                    </span>
                  </div>
                  <span className="text-xs text-default-400">{count}</span>
                </div>
              ))}
            </div>
          )}

          <Divider />

          {/* Usage */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-600">Documents</span>
              <span className="text-sm text-default-500">
                {stats?.total_documents ?? 0} / {stats?.max_documents ?? 20}
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
            {stats?.total_tokens_used !== undefined && stats.total_tokens_used > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-default-400">Tokens used</span>
                <span className="text-xs text-default-400">
                  {stats.total_tokens_used.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Retrain Button */}
          <Button
            color="default"
            variant="solid"
            className="w-full bg-default-800 text-white hover:bg-default-700"
            onPress={onRetrain}
          >
            Retrain agent
          </Button>

          {/* Limit Warning */}
          {isLimitExceeded && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-danger" />
                <span className="text-sm font-medium text-danger">Limit reached</span>
              </div>
              <p className="text-xs text-default-500">
                You&apos;ve used all {stats?.max_documents} document slots in your plan
              </p>
            </div>
          )}

          {/* Remaining Slots Info */}
          {!isLimitExceeded && stats?.remaining_slots !== undefined && stats.remaining_slots <= 5 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                <span className="text-sm font-medium text-warning">
                  {stats.remaining_slots} slots remaining
                </span>
              </div>
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
  );
}

// Helper function to get icon for each category
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    policy: "solar:shield-check-linear",
    faq: "solar:chat-square-like-linear",
    guide: "solar:book-bookmark-linear",
    product: "solar:box-linear",
    support: "solar:headphones-round-linear",
    general: "solar:document-text-linear",
  };
  return icons[category] || "solar:document-text-linear";
}
