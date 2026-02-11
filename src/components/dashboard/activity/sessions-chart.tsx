"use client";

import React from "react";
import {
  Chip,
  Button,
  Card,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tab,
  Tabs,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

type TimeFrame = "6-months" | "3-months" | "30-days" | "7-days" | "24-hours";

type ChartDataPoint = {
  label: string;
  date: Date;
  value: number;
  previousValue: number;
};

type MetricKey =
  | "total-sessions"
  | "total-conversations"
  | "total-messages"
  | "resolution-rate";

type Metric = {
  key: MetricKey;
  title: string;
  suffix: string;
  type: "number" | "percentage";
  baseValue: number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
};

const metrics: Metric[] = [
  {
    key: "total-sessions",
    title: "Total Sessions",
    suffix: "sessions",
    type: "number",
    baseValue: 147000,
    change: "12.8%",
    changeType: "positive",
  },
  {
    key: "total-conversations",
    title: "Total Conversations",
    suffix: "conversations",
    type: "number",
    baseValue: 623000,
    change: "-2.1%",
    changeType: "neutral",
  },
  {
    key: "total-messages",
    title: "Total Messages",
    suffix: "messages",
    type: "number",
    baseValue: 2312000,
    change: "-5.7%",
    changeType: "negative",
  },
  {
    key: "resolution-rate",
    title: "Resolution Rate",
    suffix: "resolved",
    type: "percentage",
    baseValue: 86.78,
    change: "2.4%",
    changeType: "positive",
  },
];

// Generate realistic data points based on timeframe
function generateChartData(
  timeFrame: TimeFrame,
  metricKey: MetricKey
): ChartDataPoint[] {
  const now = new Date();
  const data: ChartDataPoint[] = [];
  const metric = metrics.find((m) => m.key === metricKey)!;

  // Seed for consistent random values based on metric
  const seed = metricKey.charCodeAt(0) + metricKey.charCodeAt(6);
  const pseudoRandom = (i: number) =>
    Math.sin(seed * 9999 + i * 1234) * 0.5 + 0.5;

  let points: number;
  let labelFormat: (date: Date, index: number) => string;
  let getDate: (i: number) => Date;
  let getPreviousDate: (date: Date) => Date;

  switch (timeFrame) {
    case "6-months":
      points = 6;
      labelFormat = (date) =>
        date.toLocaleDateString("en-US", { month: "short" });
      getDate = (i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (points - 1 - i));
        d.setDate(1);
        return d;
      };
      getPreviousDate = (date) => {
        const d = new Date(date);
        d.setFullYear(d.getFullYear() - 1);
        return d;
      };
      break;
    case "3-months":
      points = 12; // Weekly for 3 months
      labelFormat = (date) =>
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      getDate = (i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (points - 1 - i) * 7);
        return d;
      };
      getPreviousDate = (date) => {
        const d = new Date(date);
        d.setFullYear(d.getFullYear() - 1);
        return d;
      };
      break;
    case "30-days":
      points = 30;
      labelFormat = (date, index) =>
        index % 5 === 0
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "";
      getDate = (i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (points - 1 - i));
        return d;
      };
      getPreviousDate = (date) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() - 1);
        return d;
      };
      break;
    case "7-days":
      points = 7;
      labelFormat = (date) =>
        date.toLocaleDateString("en-US", { weekday: "short" });
      getDate = (i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (points - 1 - i));
        return d;
      };
      getPreviousDate = (date) => {
        const d = new Date(date);
        d.setDate(d.getDate() - 7);
        return d;
      };
      break;
    case "24-hours":
      points = 24;
      labelFormat = (date, index) =>
        index % 4 === 0
          ? date.toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            })
          : "";
      getDate = (i) => {
        const d = new Date(now);
        d.setHours(d.getHours() - (points - 1 - i));
        d.setMinutes(0);
        d.setSeconds(0);
        return d;
      };
      getPreviousDate = (date) => {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        return d;
      };
      break;
  }

  for (let i = 0; i < points; i++) {
    const date = getDate(i);
    const variance = pseudoRandom(i) * 0.4 + 0.8; // 0.8 to 1.2
    const previousVariance = pseudoRandom(i + 100) * 0.4 + 0.6; // 0.6 to 1.0

    let value: number;
    let previousValue: number;

    if (metric.type === "percentage") {
      value = Math.min(
        100,
        Math.max(0, metric.baseValue * variance * (0.9 + pseudoRandom(i) * 0.2))
      );
      previousValue = Math.min(
        100,
        Math.max(
          0,
          metric.baseValue * previousVariance * (0.85 + pseudoRandom(i) * 0.15)
        )
      );
    } else {
      // Scale base value based on timeframe
      let scaleFactor = 1;
      if (timeFrame === "24-hours") scaleFactor = 0.04;
      else if (timeFrame === "7-days") scaleFactor = 0.14;
      else if (timeFrame === "30-days") scaleFactor = 0.03;
      else if (timeFrame === "3-months") scaleFactor = 0.08;
      else scaleFactor = 0.16;

      value = Math.round(metric.baseValue * scaleFactor * variance);
      previousValue = Math.round(
        metric.baseValue * scaleFactor * previousVariance
      );
    }

    data.push({
      label: labelFormat(date, i),
      date,
      value,
      previousValue,
    });
  }

  return data;
}

// Get comparison period label based on timeframe
function getComparisonLabel(timeFrame: TimeFrame): {
  current: string;
  previous: string;
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.toLocaleDateString("en-US", { month: "short" });

  switch (timeFrame) {
    case "6-months":
      return {
        current: `${currentYear}`,
        previous: `${currentYear - 1}`,
      };
    case "3-months":
      return {
        current: `Last 3 months`,
        previous: `Previous year`,
      };
    case "30-days":
      return {
        current: `${currentMonth} ${currentYear}`,
        previous: `Previous month`,
      };
    case "7-days":
      return {
        current: `This week`,
        previous: `Last week`,
      };
    case "24-hours":
      return {
        current: `Today`,
        previous: `Yesterday`,
      };
  }
}

const formatValue = (value: number, type: "number" | "percentage") => {
  if (type === "number") {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + "k";
    }
    return value.toLocaleString();
  }
  return `${value.toFixed(1)}%`;
};

const formatTooltipDate = (date: Date, timeFrame: TimeFrame): string => {
  switch (timeFrame) {
    case "24-hours":
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    case "7-days":
    case "30-days":
    case "3-months":
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "6-months":
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
  }
};

export default function SessionsChart() {
  const [activeMetric, setActiveMetric] = React.useState<MetricKey>(
    metrics[0].key
  );
  const [timeFrame, setTimeFrame] = React.useState<TimeFrame>("6-months");

  const chartData = React.useMemo(
    () => generateChartData(timeFrame, activeMetric),
    [timeFrame, activeMetric]
  );

  const comparisonLabels = React.useMemo(
    () => getComparisonLabel(timeFrame),
    [timeFrame]
  );

  const activeMetricData = React.useMemo(
    () => metrics.find((m) => m.key === activeMetric)!,
    [activeMetric]
  );

  const color =
    activeMetricData.changeType === "positive"
      ? "success"
      : activeMetricData.changeType === "negative"
        ? "danger"
        : "default";

  return (
    <Card
      as="dl"
      className="dark:border-default-100 border border-transparent h-full"
    >
      <section className="flex flex-col flex-nowrap">
        <div className="flex flex-col gap-y-1 p-4 pb-2">
          {/* Header row with title and tabs */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <dt className="text-medium text-foreground font-medium">
              Sessions & Activity
            </dt>
            <Tabs
              size="sm"
              classNames={{ tabList: "gap-2" }}
              selectedKey={timeFrame}
              onSelectionChange={(key) => setTimeFrame(key as TimeFrame)}
            >
              <Tab key="6-months" title="6M" />
              <Tab key="3-months" title="3M" />
              <Tab key="30-days" title="30D" />
              <Tab key="7-days" title="7D" />
              <Tab key="24-hours" title="24H" />
            </Tabs>
          </div>
          {/* Metric buttons row */}
          <div className="flex w-full items-center">
            <div className="flex w-full items-center gap-x-2 overflow-x-auto py-2">
              {metrics.map((metric) => (
                <button
                  key={metric.key}
                  className={cn(
                    "rounded-medium flex flex-col gap-1 px-3 py-2 transition-colors",
                    {
                      "bg-default-100": activeMetric === metric.key,
                    }
                  )}
                  onClick={() => setActiveMetric(metric.key)}
                >
                  <span
                    className={cn(
                      "text-tiny text-default-500 font-medium transition-colors whitespace-nowrap",
                      {
                        "text-primary": activeMetric === metric.key,
                      }
                    )}
                  >
                    {metric.title}
                  </span>
                  <div className="flex items-center gap-x-2">
                    <span className="text-foreground text-xl font-bold">
                      {formatValue(metric.baseValue, metric.type)}
                    </span>
                    <Chip
                      classNames={{
                        base: "h-5 px-1",
                        content: "text-tiny font-medium px-0.5",
                      }}
                      color={
                        metric.changeType === "positive"
                          ? "success"
                          : metric.changeType === "negative"
                            ? "danger"
                            : "default"
                      }
                      radius="sm"
                      size="sm"
                      startContent={
                        metric.changeType === "positive" ? (
                          <Icon
                            height={12}
                            icon={"solar:arrow-right-up-linear"}
                            width={12}
                          />
                        ) : metric.changeType === "negative" ? (
                          <Icon
                            height={12}
                            icon={"solar:arrow-right-down-linear"}
                            width={12}
                          />
                        ) : (
                          <Icon
                            height={12}
                            icon={"solar:arrow-right-linear"}
                            width={12}
                          />
                        )
                      }
                      variant="flat"
                    >
                      <span>{metric.change}</span>
                    </Chip>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer
          className="min-h-[200px] [&_.recharts-surface]:outline-hidden"
          height={200}
          width="100%"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            height={200}
            margin={{
              left: 0,
              right: 0,
              top: 5,
              bottom: 5,
            }}
            width={500}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="10%"
                  stopColor={`hsl(var(--heroui-${color}-500))`}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={`hsl(var(--heroui-${color}-100))`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontalCoordinatesGenerator={() => [200, 150, 100, 50]}
              stroke="hsl(var(--heroui-default-200))"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="label"
              style={{
                fontSize: "var(--heroui-font-size-tiny)",
              }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const dataPoint = payload[0]?.payload as ChartDataPoint;
                if (!dataPoint) return null;

                return (
                  <div className="rounded-medium bg-foreground text-tiny shadow-small flex h-auto min-w-[140px] flex-col gap-y-1 p-2">
                    <span className="text-small text-foreground-400 font-medium">
                      {formatTooltipDate(dataPoint.date, timeFrame)}
                    </span>
                    <div className="flex items-center gap-x-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: `hsl(var(--heroui-${color === "default" ? "foreground" : color}))`,
                        }}
                      />
                      <span className="text-small text-background">
                        {formatValue(dataPoint.value, activeMetricData.type)}{" "}
                        {activeMetricData.suffix}
                      </span>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: "hsl(var(--heroui-default-400))",
                        }}
                      />
                      <span className="text-small text-foreground-400">
                        {formatValue(
                          dataPoint.previousValue,
                          activeMetricData.type
                        )}{" "}
                        {activeMetricData.suffix}
                      </span>
                    </div>
                  </div>
                );
              }}
              cursor={{
                strokeWidth: 0,
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={36}
              content={() => (
                <div className="flex items-center justify-end gap-4 pr-4 text-tiny">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: `hsl(var(--heroui-${color === "default" ? "foreground" : color}))`,
                      }}
                    />
                    <span className="text-default-600">
                      {comparisonLabels.current}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: "hsl(var(--heroui-default-400))",
                      }}
                    />
                    <span className="text-default-400">
                      {comparisonLabels.previous}
                    </span>
                  </div>
                </div>
              )}
            />
            <Area
              activeDot={{
                stroke: `hsl(var(--heroui-${color === "default" ? "foreground" : color}))`,
                strokeWidth: 2,
                fill: "hsl(var(--heroui-background))",
                r: 5,
              }}
              animationDuration={1000}
              animationEasing="ease"
              dataKey="value"
              fill="url(#colorGradient)"
              stroke={`hsl(var(--heroui-${color === "default" ? "foreground" : color}))`}
              strokeWidth={2}
              type="monotone"
              name={comparisonLabels.current}
            />
            <Area
              activeDot={{
                stroke: "hsl(var(--heroui-default-400))",
                strokeWidth: 2,
                fill: "hsl(var(--heroui-background))",
                r: 5,
              }}
              animationDuration={1000}
              animationEasing="ease"
              dataKey="previousValue"
              fill="transparent"
              stroke="hsl(var(--heroui-default-400))"
              strokeWidth={2}
              type="monotone"
              name={comparisonLabels.previous}
            />
          </AreaChart>
        </ResponsiveContainer>
        <Dropdown
          classNames={{
            content: "min-w-[120px]",
          }}
          placement="bottom-end"
        >
          <DropdownTrigger>
            <Button
              isIconOnly
              className="absolute top-2 right-2 w-auto rounded-full"
              size="sm"
              variant="light"
            >
              <Icon height={16} icon="solar:menu-dots-bold" width={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            itemClasses={{
              title: "text-tiny",
            }}
            variant="flat"
          >
            <DropdownItem key="view-details">View Details</DropdownItem>
            <DropdownItem key="export-data">Export Data</DropdownItem>
            <DropdownItem key="set-alert">Set Alert</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </section>
    </Card>
  );
}
