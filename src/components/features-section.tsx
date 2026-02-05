"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

function FeatureCard({
  icon,
  title,
  description,
  className = "",
}: FeatureCardProps) {
  return (
    <div className={`relative rounded-2xl ${className}`}>
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={164}
        inactiveZone={0.01}
        borderWidth={3}
      />
      <Card
        className="h-full border border-white/10 bg-white/5 backdrop-blur-sm"
        isBlurred
        shadow="none"
      >
        <CardBody className="flex flex-col justify-start gap-3 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
            <Icon icon={icon} className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm leading-relaxed text-white/70">{description}</p>
        </CardBody>
      </Card>
    </div>
  );
}

export default function FeaturesSection() {
  const t = useTranslations("sections");

  const features = [
    {
      icon: "solar:chat-round-dots-bold",
      title: "Intelligent Conversations",
      description:
        "AI-powered chat that understands context and provides meaningful responses to your customers.",
    },
    {
      icon: "solar:bolt-circle-bold",
      title: "Lightning Fast",
      description:
        "Instant responses with sub-second latency. Keep your customers engaged without delays.",
    },
    {
      icon: "solar:shield-check-bold",
      title: "Enterprise Security",
      description:
        "Bank-grade encryption and compliance. Your data is protected with industry-leading security standards. SOC2 and GDPR compliant.",
    },
    {
      icon: "solar:chart-2-bold",
      title: "Analytics Dashboard",
      description:
        "Gain insights into customer behavior with comprehensive analytics. Track conversations, measure satisfaction, and optimize your support workflow.",
    },
  ];

  return (
    <section className="bg-black flex flex-col items-center justify-center rounded-2xl px-6 py-24 md:rounded-3xl md:py-32">
      <span className="text-default-500 mb-4 text-sm font-medium uppercase tracking-wider">
        {t("features")}
      </span>
      <h2 className="mb-12 max-w-2xl text-center text-3xl font-bold text-white md:text-4xl">
        Everything you need to deliver exceptional customer support
      </h2>

      {/* Mosaic Grid Layout */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
        {/* Top Left - 1x1 */}
        <FeatureCard
          icon={features[0].icon}
          title={features[0].title}
          description={features[0].description}
          className="md:col-span-1 md:row-span-1 md:min-h-[200px]"
        />

        {/* Top Middle - 1x1 */}
        <FeatureCard
          icon={features[1].icon}
          title={features[1].title}
          description={features[1].description}
          className="md:col-span-1 md:row-span-1 md:min-h-[200px]"
        />

        {/* Right Vertical - 1 column, 2 rows */}
        <FeatureCard
          icon={features[2].icon}
          title={features[2].title}
          description={features[2].description}
          className="md:col-span-1 md:row-span-2"
        />

        {/* Bottom Wide - 2 columns, 1 row */}
        <FeatureCard
          icon={features[3].icon}
          title={features[3].title}
          description={features[3].description}
          className="md:col-span-2 md:row-span-1 md:min-h-[200px]"
        />
      </div>
    </section>
  );
}
