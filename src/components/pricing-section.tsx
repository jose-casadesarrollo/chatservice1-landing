"use client";

import React from "react";
import { useTranslations } from "next-intl";

export default function PricingSection() {
  const t = useTranslations("sections");

  return (
    <section className="bg-gradient-5 flex flex-col items-center justify-center rounded-2xl px-6 py-24 md:rounded-3xl md:py-32">
      <span className="text-default-500 text-sm font-medium uppercase tracking-wider">
        {t("pricing")}
      </span>
    </section>
  );
}
