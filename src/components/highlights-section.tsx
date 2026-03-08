"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";

// ─── Card 1 Visual: LLM providers hub ────────────────────────────────────────
function LLMProvidersVisual() {
  const rows: Array<Array<{ icon?: string; bg: string; iconColor?: string; content?: React.ReactNode }>> = [
    [
      { bg: "bg-gradient-to-b from-blue-500 to-blue-700" },
      { icon: "simple-icons:anthropic", bg: "bg-white border border-gray-200", iconColor: "text-gray-900" },
      { icon: "logos:google-icon", bg: "bg-white border border-gray-200" },
      { icon: "simple-icons:openai", bg: "bg-white border border-gray-200", iconColor: "text-gray-900" },
      { bg: "bg-gray-50 border border-gray-200" },
    ],
    [
      { bg: "bg-gray-50 border border-gray-200" },
      {
        bg: "bg-white border border-gray-200",
        content: (
          <svg viewBox="0 0 36 36" className="h-7 w-7">
            <ellipse cx="13" cy="20" rx="8" ry="9" fill="#2e7d32" />
            <ellipse cx="23" cy="16" rx="7" ry="7" fill="#e53935" />
          </svg>
        ),
      },
      { bg: "bg-gray-50 border border-gray-200" },
      { bg: "bg-gradient-to-br from-blue-400 to-violet-500" },
      { bg: "bg-gray-50 border border-gray-200" },
    ],
  ];

  return (
    <div className="flex flex-col items-center pb-6 pt-8">
      <div className="relative flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-2xl bg-gray-900 shadow-lg">
        <div className="absolute bottom-0 left-0 h-12 w-12 -translate-x-1 translate-y-2 rounded-full bg-gradient-to-tr from-pink-500 to-fuchsia-400 opacity-90 blur-md" />
        <span className="relative z-10 text-2xl font-black text-white">C</span>
      </div>

      <div className="flex w-full items-center justify-center overflow-hidden">
        <svg width="320" height="34" viewBox="0 0 320 34" fill="none" style={{ flexShrink: 0 }}>
          <line x1="160" y1="0" x2="160" y2="14" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="28" y1="14" x2="292" y2="14" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 3" />
          {[28, 94, 160, 226, 292].map((x) => (
            <line key={x} x1={x} y1="14" x2={x} y2="34" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 3" />
          ))}
        </svg>
      </div>

      <div className="flex w-full flex-col items-center gap-2.5 overflow-hidden">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-2.5" style={{ width: "320px" }}>
            {row.map((tile, ti) => (
              <div
                key={ti}
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${tile.bg}`}
              >
                {tile.icon && <Icon icon={tile.icon} className={`h-7 w-7 ${tile.iconColor ?? ""}`} />}
                {tile.content}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card 2 Visual: UI simplicity mockup ─────────────────────────────────────
function SimplicityVisual() {
  const t = useTranslations("highlights.card2");
  return (
    <div className="relative h-64 w-full overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-gray-300"
        style={{ width: "210px", height: "210px" }}
      />

      <div className="absolute left-5 top-6 z-10 flex w-fit items-center gap-0.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-sm">
        {(["B", "I", "U", "S"] as const).map((char) => (
          <span
            key={char}
            className={`flex h-6 w-6 items-center justify-center rounded text-xs text-gray-700 ${
              char === "B" ? "font-bold" : char === "I" ? "italic" : char === "U" ? "underline" : "line-through"
            }`}
          >
            {char}
          </span>
        ))}
      </div>

      <div className="absolute right-4 top-5 z-10 flex flex-row gap-1.5">
        <div className="h-9 w-9 rounded-full bg-green-800 shadow-sm" />
        <div className="h-9 w-9 rounded-full bg-green-500 shadow-sm" />
        <div className="h-9 w-9 rounded-full bg-lime-400 shadow-sm" />
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="relative overflow-hidden whitespace-nowrap rounded-xl bg-gray-900 px-9 py-3.5 shadow-lg">
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-fuchsia-500 to-pink-400" />
          <span className="text-sm font-semibold text-white">{t("createAgent")}</span>
        </div>
      </div>

      <div className="absolute bottom-14 right-8 z-10 flex h-6 w-11 items-center justify-end rounded-full bg-green-500 px-0.5 shadow-sm">
        <div className="h-5 w-5 rounded-full bg-white shadow-sm" />
      </div>

      <div className="absolute bottom-6 left-5 z-10 flex w-fit items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-gray-500">
          <path d="M8 0l1.5 5.5L15 8l-5.5 1.5L8 16l-1.5-5.5L1 8l5.5-1.5z" />
        </svg>
        <span className="text-xs font-medium text-gray-700">{t("replyWithAI")}</span>
      </div>
    </div>
  );
}

// ─── Card 3 Visual: Security shield ──────────────────────────────────────────
function SecurityVisual() {
  return (
    <div className="relative flex items-center justify-center overflow-hidden" style={{ height: "256px" }}>
      <div
        className="absolute -top-1 right-8 h-16 w-[68px] bg-gradient-to-b from-orange-400 to-red-600"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)" }}
      />

      <div className="absolute rounded-full border border-dashed border-gray-300" style={{ width: "188px", height: "188px" }} />
      <div className="absolute rounded-full border border-dashed border-gray-300" style={{ width: "122px", height: "122px" }} />

      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
        <Icon icon="solar:settings-bold" className="h-4 w-4 text-gray-400" />
      </div>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
        <Icon icon="solar:shield-plus-bold" className="h-4 w-4 text-gray-400" />
      </div>

      <div className="absolute z-0 h-16 w-24 rounded-full bg-fuchsia-400/50 blur-2xl" />

      <div className="relative z-10 flex h-[90px] w-[90px] items-center justify-center rounded-2xl bg-gray-950 shadow-2xl">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-pink-500/60 via-fuchsia-500/20 to-transparent" />
        <Icon icon="solar:shield-keyhole-bold" className="relative z-10 h-12 w-12 text-white" />
      </div>

      <div className="absolute bottom-5 flex items-center gap-1.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-gray-500" />
        ))}
        <Icon icon="solar:key-minimalistic-bold" className="ml-1 h-4 w-4 rotate-12 text-gray-400" />
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export default function HighlightsSection() {
  const t = useTranslations("highlights");

  const cardData = [
    {
      key: "card1",
      title: t("card1.title"),
      description: t("card1.description"),
      visual: <LLMProvidersVisual />,
    },
    {
      key: "card2",
      title: t("card2.title"),
      description: t("card2.description"),
      visual: <SimplicityVisual />,
    },
    {
      key: "card3",
      title: t("card3.title"),
      description: t("card3.description"),
      visual: <SecurityVisual />,
      extraClass: "md:col-span-2 lg:col-span-1",
    },
  ];

  return (
    <section id="highlights" className="w-full rounded-2xl bg-[#F9F9F8] py-12 md:rounded-3xl md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 py-12">
          {/* Badge + heading block */}
          <div className="flex flex-col items-start gap-4">
            {/* Badge — gradient dot matching Chatbase */}
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-900">
              <div className="mr-2 h-2 w-2 rounded-full bg-gradient-to-r from-[#FB923C] via-[#F472B6] to-[#E879F9]" />
              {t("badge")}
            </div>

            {/* Heading + description row — description aligns to bottom of heading */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-10">
              <h2 className="text-4xl font-medium tracking-tight text-gray-900 lg:text-5xl">
                {t("title")}
              </h2>
              <p className="max-w-[600px] text-lg text-gray-500">
                {t("description")}
              </p>
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3">
            {cardData.map((card) => (
              <div
                key={card.key}
                className={`relative flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 ${
                  "extraClass" in card ? (card as { extraClass: string }).extraClass : ""
                }`}
              >
                {card.visual}
                <div className="space-y-2 px-6 pb-6">
                  <h3 className="text-xl font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-base text-gray-500">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
