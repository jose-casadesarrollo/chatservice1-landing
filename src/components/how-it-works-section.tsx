"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

interface StepCardProps {
  stepNumber: number;
  icon: string;
  title: string;
  description: string;
}

function StepCard({ stepNumber, icon, title, description }: StepCardProps) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Step Number Badge */}
      <div className="absolute -top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white shadow-lg">
        {stepNumber}
      </div>

      <div className="h-full w-full pt-2">
        <Card
          className="h-full border border-white/10 bg-black"
          shadow="none"
        >
          <CardBody className="flex flex-col items-center gap-4 p-6 pt-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Icon icon={icon} className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-medium text-white">{title}</h3>
            <p className="text-sm font-medium leading-relaxed text-white">
              {description}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  const t = useTranslations("howItWorks");

  const steps = [
    {
      icon: "solar:user-plus-bold",
      title: t("step1.title"),
      description: t("step1.description"),
    },
    {
      icon: "solar:code-bold",
      title: t("step2.title"),
      description: t("step2.description"),
    },
    {
      icon: "solar:palette-bold",
      title: t("step3.title"),
      description: t("step3.description"),
    },
  ];

  return (
    <section className="bg-gradient-3 flex flex-col items-center justify-center rounded-2xl px-6 py-24 md:rounded-3xl md:py-32">
      <span className="text-default-500 mb-4 text-sm font-medium uppercase tracking-wider">
        {t("label")}
      </span>
      <h2 className="mb-6 max-w-2xl text-center text-3xl font-bold text-black md:text-4xl">
        {t("title")}
      </h2>
      <p className="mb-16 max-w-xl text-center text-black/70">
        {t("subtitle")}
      </p>

      {/* Steps Grid */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
        {steps.map((step, index) => (
          <StepCard
            key={index}
            stepNumber={index + 1}
            icon={step.icon}
            title={step.title}
            description={step.description}
          />
        ))}
      </div>

      {/* Connector Lines (visible on desktop) */}
      <div className="mt-8 hidden w-full max-w-3xl items-center justify-center md:flex">
        <div className="flex w-full items-center justify-between px-12">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-primary/30 to-primary/50"></div>
          <div className="mx-2 h-2 w-2 rounded-full bg-primary/50"></div>
          <div className="h-0.5 flex-1 bg-gradient-to-r from-primary/50 via-primary/30 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
