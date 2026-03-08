"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";

// Placeholder visual for cards - will be replaced one by one
function PlaceholderVisual() {
  return (
    <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-zinc-100">
      <span className="text-sm text-zinc-400">Visual placeholder</span>
    </div>
  );
}

// ─── Card 1 Visual: Sync with real-time data ────────────────────────────────
function SyncDataVisual() {
  const t = useTranslations("bentoFeatures.card1");
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-zinc-50 px-6 pb-6 pt-14"
      style={{
        backgroundImage:
          "radial-gradient(circle, #d4d4d8 0.8px, transparent 0.8px)",
        backgroundSize: "16px 16px",
      }}
    >
      {/* User message */}
      <div className="mb-5 flex items-center justify-end gap-2.5">
        <div className="rounded-full bg-white px-4 py-2.5 text-[13px] text-zinc-700 shadow-sm ring-1 ring-zinc-200/60">
          {t("userMessage")}
        </div>
        {/* Realistic avatar */}
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-sm ring-1 ring-zinc-200/60">
          <svg viewBox="0 0 32 32" className="h-full w-full">
            <rect width="32" height="32" fill="#f5d0b0" />
            <ellipse cx="16" cy="14" rx="7" ry="8" fill="#f5d0b0" />
            <ellipse cx="16" cy="11" rx="7.5" ry="7" fill="#8B5E3C" />
            <ellipse cx="16" cy="8" rx="8" ry="5" fill="#6B3F2A" />
            <circle cx="13" cy="14" r="1" fill="#3d2515" />
            <circle cx="19" cy="14" r="1" fill="#3d2515" />
            <ellipse cx="16" cy="17.5" rx="2" ry="1" fill="#d4976a" />
            <ellipse cx="16" cy="30" rx="10" ry="8" fill="#e8e8e8" />
          </svg>
        </div>
      </div>

      {/* Bot message */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 shadow-sm">
          <svg viewBox="0 0 16 16" className="h-4 w-4">
            <circle cx="8" cy="8" r="3.5" fill="none" stroke="white" strokeWidth="1.2" />
            <line x1="8" y1="3" x2="8" y2="13" stroke="white" strokeWidth="1.2" />
            <line x1="3" y1="8" x2="13" y2="8" stroke="white" strokeWidth="1.2" />
          </svg>
        </div>
        <div className="rounded-full bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200/60">
          {t("botMessage")}
        </div>
      </div>

      {/* Order status card + API badge */}
      <div className="flex items-end gap-3 pl-10">
        <div className="flex-1 rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-zinc-200/60">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-zinc-800">
              {t("orderStatus")}
            </span>
            <span className="text-[11px] text-zinc-400">{t("orderArrival")}</span>
          </div>
          <div className="h-[5px] w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"
              style={{ width: "72%" }}
            />
          </div>
        </div>

        {/* API badge */}
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg">
          <Icon icon="solar:link-round-bold" className="h-5 w-5 text-white" />
          <span className="mt-0.5 text-[8px] font-bold tracking-wide text-white/90">
            API
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Card 2 Visual: Take actions on your systems ────────────────────────────
function ActionsVisual() {
  const t = useTranslations("bentoFeatures.card2");
  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-50 px-5 pb-5 pt-8">
      {/* Top action cards row */}
      <div className="flex gap-4">
        {/* Update subscription card */}
        <div className="flex-1 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/60">
          <div className="mb-2.5 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500">
              <span className="text-[9px] font-bold text-white">S</span>
            </div>
            <span className="text-[12px] font-medium text-zinc-700">
              {t("updateSubscription")}
            </span>
          </div>
          <div className="h-1 w-3/4 rounded-full bg-blue-400/60" />
        </div>

        {/* Update database card */}
        <div className="flex-1 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/60">
          <div className="mb-2.5 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500">
              <span className="text-[9px] font-bold text-white">D</span>
            </div>
            <span className="text-[12px] font-medium text-zinc-700">
              {t("updateDatabase")}
            </span>
          </div>
          <div className="h-1 w-3/4 rounded-full bg-blue-400/60" />
        </div>
      </div>

      {/* Dashed connector + AI action badge */}
      <div className="relative flex items-center justify-center py-3">
        {/* Dashed arc */}
        <svg
          viewBox="0 0 200 32"
          className="absolute top-0 h-6 w-48"
          fill="none"
        >
          <path
            d="M10 0 C10 24, 100 28, 100 28 C100 28, 190 24, 190 0"
            stroke="#d4d4d8"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            fill="none"
          />
        </svg>
        {/* AI action pill */}
        <div className="relative z-10 mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-400 to-pink-400 px-3.5 py-1.5 shadow-md">
          <svg viewBox="0 0 12 12" className="h-3 w-3 fill-white">
            <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5z" />
          </svg>
          <span className="text-[11px] font-semibold text-white">
            {t("aiAction")}
          </span>
        </div>
      </div>

      {/* Plan updated result card */}
      <div className="ml-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/60">
        <div className="mb-2.5 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900">
            <svg viewBox="0 0 12 12" className="h-3 w-3 fill-white">
              <polygon points="4.5,2 4.5,10 10,6" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-zinc-800">
            {t("planUpdated")}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] text-zinc-400 line-through">
            $250.00
          </span>
          <span className="text-[15px] font-bold text-zinc-900">
            $200.00
          </span>
          <span className="text-[12px] text-zinc-500">/m</span>
          <span className="ml-auto text-[12px] font-medium text-zinc-400">
            {t("proPlan")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Card 3 Visual: Compare AI models ────────────────────────────────────────
function CompareModelsVisual() {
  const t = useTranslations("bentoFeatures.card3");
  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-50 px-4 pb-2 pt-5">
      {/* User message */}
      <div className="mb-5 flex items-start gap-2 px-1">
        <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-amber-200 to-amber-400 ring-1 ring-zinc-200/60">
          <svg viewBox="0 0 24 24" className="h-full w-full">
            <rect width="24" height="24" fill="#f5d0b0" />
            <ellipse cx="12" cy="10" rx="5" ry="5.5" fill="#8B5E3C" />
            <ellipse cx="12" cy="7" rx="5.5" ry="3.5" fill="#6B3F2A" />
            <circle cx="10" cy="10.5" r="0.7" fill="#3d2515" />
            <circle cx="14" cy="10.5" r="0.7" fill="#3d2515" />
            <ellipse cx="12" cy="22" rx="7" ry="6" fill="#e8e8e8" />
          </svg>
        </div>
        <div className="rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[11px] leading-relaxed text-zinc-700 shadow-sm ring-1 ring-zinc-200/60">
          {t("userMessage")}
        </div>
      </div>

      {/* Model comparison panels */}
      <div className="relative flex gap-2">
        {/* GPT-4o panel */}
        <div className="relative flex-1 overflow-hidden rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/60">
          <div className="mb-3 flex items-center gap-1.5">
            <Icon icon="simple-icons:openai" className="h-3.5 w-3.5 text-zinc-800" />
            <span className="text-[11px] font-medium text-zinc-700">gpt-4o</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 w-full rounded-full bg-zinc-200" />
            <div className="h-1.5 w-4/5 rounded-full bg-zinc-200" />
            <div className="h-1.5 w-full rounded-full bg-zinc-200" />
            <div className="h-1.5 w-3/5 rounded-full bg-zinc-200" />
          </div>
          {/* Warm gradient accent overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-orange-300/50 via-rose-300/30 to-transparent" />
        </div>

        {/* Comparison icon */}
        <div className="absolute left-1/2 top-1/2 z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-zinc-200/60">
          <Icon icon="solar:transfer-horizontal-bold" className="h-3.5 w-3.5 text-zinc-500" />
        </div>

        {/* Gemini panel */}
        <div className="flex-1 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/60">
          <div className="mb-3 flex items-center gap-1.5">
            <Icon icon="logos:google-icon" className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium text-zinc-700">Gemini</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 w-full rounded-full bg-zinc-200" />
            <div className="h-1.5 w-3/4 rounded-full bg-zinc-200" />
            <div className="h-1.5 w-full rounded-full bg-zinc-200" />
            <div className="h-1.5 w-2/3 rounded-full bg-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card 4 Visual: Smart escalation ─────────────────────────────────────────
function EscalationVisual() {
  const t = useTranslations("bentoFeatures.card4");
  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-50 px-5 pb-4 pt-6">
      {/* User message */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <div className="rounded-full bg-white px-3.5 py-2 text-[12px] text-zinc-700 shadow-sm ring-1 ring-zinc-200/60">
          {t("userMessage")}
        </div>
        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-amber-200 to-amber-400 ring-1 ring-zinc-200/60">
          <svg viewBox="0 0 24 24" className="h-full w-full">
            <rect width="24" height="24" fill="#f5d0b0" />
            <ellipse cx="12" cy="10" rx="5" ry="5.5" fill="#8B5E3C" />
            <ellipse cx="12" cy="7" rx="5.5" ry="3.5" fill="#6B3F2A" />
            <circle cx="10" cy="10.5" r="0.7" fill="#3d2515" />
            <circle cx="14" cy="10.5" r="0.7" fill="#3d2515" />
            <ellipse cx="12" cy="22" rx="7" ry="6" fill="#e8e8e8" />
          </svg>
        </div>
      </div>

      {/* Bot message */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
            <circle cx="8" cy="8" r="3.5" fill="none" stroke="white" strokeWidth="1.2" />
            <line x1="8" y1="3" x2="8" y2="13" stroke="white" strokeWidth="1.2" />
            <line x1="3" y1="8" x2="13" y2="8" stroke="white" strokeWidth="1.2" />
          </svg>
        </div>
        <div className="rounded-full bg-white px-3.5 py-2 text-[12px] font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200/60">
          {t("botMessage")}
        </div>
      </div>

      {/* Ticket submitted label */}
      <div className="mb-3 flex items-center justify-center gap-1.5">
        <svg viewBox="0 0 12 12" className="h-3 w-3 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 6l3 3 5-5" />
        </svg>
        <span className="text-[10px] text-zinc-400">{t("ticketSubmitted")}</span>
      </div>

      {/* Ticket card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200/60">
        <div className="flex items-center gap-2.5 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500">
            <Icon icon="solar:ticket-bold" className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-[12px] font-semibold text-zinc-800">
              {t("ticketNumber")}
            </span>
            <div className="text-[10px] text-zinc-400">{t("ticketStatus")}</div>
          </div>
          <span className="text-[10px] text-zinc-400">{t("ticketTime")}</span>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400" />
      </div>
    </div>
  );
}

// ─── Card 5 Visual: Advanced reporting ───────────────────────────────────────
function ReportingVisual() {
  const t = useTranslations("bentoFeatures.card5");
  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-50 p-4">
      {/* Dashboard card */}
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/60">
        {/* Header */}
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-zinc-700">
            {t("topics")}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
            <span className="text-[10px] text-zinc-500">{t("accountSetup")}</span>
            <span className="text-[11px] font-semibold text-zinc-800">
              643
            </span>
          </div>
        </div>

        {/* Line chart */}
        <div className="relative my-3">
          <svg viewBox="0 0 240 80" className="h-20 w-full" fill="none">
            {/* Grid lines */}
            {[20, 40, 60].map((y) => (
              <line key={y} x1="0" y1={y} x2="240" y2={y} stroke="#f4f4f5" strokeWidth="1" />
            ))}
            {/* Gray line 1 */}
            <path
              d="M0 55 C30 50, 60 45, 90 48 C120 51, 150 40, 180 42 C210 44, 230 38, 240 40"
              stroke="#d4d4d8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Gray line 2 */}
            <path
              d="M0 35 C30 40, 60 38, 90 42 C120 46, 150 50, 180 48 C210 46, 230 52, 240 50"
              stroke="#e4e4e7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Purple main line */}
            <path
              d="M0 45 C30 35, 60 30, 90 25 C120 20, 140 50, 170 35 C200 20, 220 15, 240 18"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Purple line dot */}
            <circle cx="170" cy="35" r="3" fill="#8b5cf6" />
          </svg>
          {/* Cursor overlay */}
          <div className="absolute right-8 top-2">
            <svg viewBox="0 0 20 24" className="h-8 w-7 drop-shadow-md">
              <path d="M4 0L4 18L8 14L12 22L15 20.5L11 13L16 12Z" fill="#1c1c1c" stroke="white" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Sentiment badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">👍</span>
            <span className="text-[11px] font-semibold text-green-600">94%</span>
            <span className="text-[11px] text-zinc-500">{t("positive")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">👎</span>
            <span className="text-[11px] font-semibold text-red-500">4%</span>
            <span className="text-[11px] text-zinc-500">{t("negative")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bento Card ──────────────────────────────────────────────────────────────
interface BentoCardProps {
  title: string;
  description: string;
  visual: React.ReactNode;
}

function BentoCard({ title, description, visual }: BentoCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 hover:border-zinc-300">
      <div className="w-full flex-1 rounded-2xl px-4 pt-4">{visual}</div>
      <div className="flex flex-col gap-2 px-5 pb-5 pt-4">
        <h3 className="text-lg font-medium leading-[21.78px] tracking-[-0.02em] text-zinc-800">
          {title}
        </h3>
        <p className="text-[14px] leading-[22px] tracking-[-0.02em] text-zinc-600">
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Integration pill ────────────────────────────────────────────────────────
const integrationsRow1 = [
  { name: "Make", icon: "logos:make" },
  { name: "Zendesk", icon: "simple-icons:zendesk", color: "#03363D" },
  { name: "Notion", icon: "logos:notion-icon" },
  { name: "Slack", icon: "logos:slack-icon" },
  { name: "Stripe", icon: "logos:stripe" },
  { name: "Salesforce", icon: "logos:salesforce" },
];

const integrationsRow2 = [
  { name: "Cal.com", icon: "simple-icons:caldotcom", color: "#292929" },
  { name: "Calendly", icon: "logos:calendly-icon" },
  { name: "WhatsApp", icon: "logos:whatsapp-icon" },
  { name: "Zapier", icon: "logos:zapier-icon" },
  { name: "Messenger", icon: "logos:messenger" },
];

function IntegrationPill({
  name,
  icon,
  color,
}: {
  name: string;
  icon: string;
  color?: string;
}) {
  return (
    <div className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-zinc-100 p-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white transition-colors hover:border-zinc-300">
        <Icon icon={icon} className="h-5 w-5" style={color ? { color } : undefined} />
      </div>
      <div className="pr-2 text-sm font-medium text-zinc-800">{name}</div>
    </div>
  );
}

// ─── Mini Feature (bottom row) ───────────────────────────────────────────────
function MiniFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 text-zinc-500">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-zinc-800">{title}</h3>
        <p className="mt-1 text-sm text-zinc-600">{description}</p>
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export default function BentoFeaturesSection() {
  const t = useTranslations("bentoFeatures");
  return (
    <section className="w-full rounded-2xl bg-[#F9F9F8] py-12 md:rounded-3xl md:py-16">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col items-start gap-4">
            <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-zinc-800">
              <div className="mr-2 h-2 w-2 rounded-full bg-gradient-to-r from-[#FB923C] via-[#F472B6] to-[#E879F9]" />
              {t("badge")}
            </div>
            <h2 className="text-4xl font-medium tracking-tight text-zinc-900 lg:text-5xl">
              {t("title")}
            </h2>
            <p className="max-w-[800px] text-lg text-zinc-500">
              {t("description")}
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid gap-8 py-12">
            {/* Row 1: 2 cards */}
            <div className="grid gap-8 md:grid-cols-2">
              <BentoCard
                title={t("card1.title")}
                description={t("card1.description")}
                visual={<SyncDataVisual />}
              />
              <BentoCard
                title={t("card2.title")}
                description={t("card2.description")}
                visual={<ActionsVisual />}
              />
            </div>

            {/* Row 2: 3 cards */}
            <div className="grid gap-8 md:grid-cols-3">
              <BentoCard
                title={t("card3.title")}
                description={t("card3.description")}
                visual={<CompareModelsVisual />}
              />
              <BentoCard
                title={t("card4.title")}
                description={t("card4.description")}
                visual={<EscalationVisual />}
              />
              <BentoCard
                title={t("card5.title")}
                description={t("card5.description")}
                visual={<ReportingVisual />}
              />
            </div>

            {/* Row 3: Integrations card */}
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
              {/* Desktop */}
              <div className="hidden md:flex md:items-start md:justify-between md:p-8 md:pr-0">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium leading-[21.78px] tracking-[-0.02em] text-zinc-800">
                    {t("integrations.title")}
                  </h3>
                  <p className="max-w-[400px] text-[14px] leading-[22px] tracking-[-0.02em] text-zinc-600">
                    {t("integrations.description")}
                  </p>
                </div>
                <div className="relative flex max-h-[180px] max-w-[60%] flex-col gap-3 overflow-hidden">
                  <div className="flex gap-3">
                    {integrationsRow1.map((item) => (
                      <IntegrationPill key={item.name} {...item} />
                    ))}
                    {/* Yellow/gold cloud decoration */}
                    <div className="h-10 w-[100px] shrink-0 rounded-full bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 opacity-80" />
                  </div>
                  <div className="ml-8 flex gap-3">
                    {/* Green cloud decoration */}
                    <div className="h-10 w-[100px] shrink-0 rounded-full bg-gradient-to-r from-emerald-200 via-green-200 to-teal-200 opacity-80" />
                    {integrationsRow2.map((item) => (
                      <IntegrationPill key={item.name} {...item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div className="md:hidden">
                <div className="relative mt-4 flex max-h-[180px] flex-col gap-3 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
                  <div className="flex gap-3">
                    {integrationsRow1.map((item) => (
                      <IntegrationPill key={item.name} {...item} />
                    ))}
                    <div className="h-10 w-[100px] shrink-0 rounded-full bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 opacity-80" />
                  </div>
                  <div className="ml-8 flex gap-3">
                    <div className="h-10 w-[100px] shrink-0 rounded-full bg-gradient-to-r from-emerald-200 via-green-200 to-teal-200 opacity-80" />
                    {integrationsRow2.map((item) => (
                      <IntegrationPill key={item.name} {...item} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-6 pt-10">
                  <h3 className="text-lg font-medium leading-[21.78px] tracking-[-0.02em] text-zinc-800">
                    {t("integrations.title")}
                  </h3>
                  <p className="max-w-[400px] text-[14px] leading-[22px] tracking-[-0.02em] text-zinc-600">
                    {t("integrations.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Row 4: Mini features */}
            <div className="hidden md:block">
              <div className="grid w-full grid-cols-3 items-center gap-16">
                <MiniFeature
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg>
                  }
                  title={t("mini1.title")}
                  description={t("mini1.description")}
                />
                <MiniFeature
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6" /><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7" /><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1" /><path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1" /><path d="M9 6v12" /></svg>
                  }
                  title={t("mini2.title")}
                  description={t("mini2.description")}
                />
                <MiniFeature
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></svg>
                  }
                  title={t("mini3.title")}
                  description={t("mini3.description")}
                />
              </div>
            </div>

            {/* Mobile mini features */}
            <div className="md:hidden">
              <div className="mt-6 flex flex-col gap-8">
                <MiniFeature
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg>
                  }
                  title={t("mini1.title")}
                  description={t("mini1.description")}
                />
                <MiniFeature
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6" /><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7" /><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1" /><path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1" /><path d="M9 6v12" /></svg>
                  }
                  title={t("mini2.title")}
                  description={t("mini2.description")}
                />
                <MiniFeature
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></svg>
                  }
                  title={t("mini3.title")}
                  description={t("mini3.description")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
