"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function CtaSection() {
  const t = useTranslations("cta");

  return (
    <section className="bg-[#F9F9F8] flex flex-col items-center rounded-2xl px-6 py-24 text-center md:rounded-3xl md:py-32">
      <h2 className="mb-6 max-w-3xl text-3xl font-bold text-black md:text-5xl">
        {t("title")}
      </h2>
      <p className="mb-10 max-w-xl text-lg text-black/60">
        {t("subtitle")}
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Button
          color="primary"
          variant="solid"
          radius="full"
          size="lg"
          endContent={
            <Icon icon="solar:alt-arrow-right-linear" className="h-5 w-5" />
          }
        >
          {t("primaryCta")}
        </Button>
        <Button
          variant="bordered"
          radius="full"
          size="lg"
          className="border-black/20 text-black"
        >
          {t("secondaryCta")}
        </Button>
      </div>

      <p className="mt-6 text-sm text-black/40">{t("reassurance")}</p>
    </section>
  );
}
