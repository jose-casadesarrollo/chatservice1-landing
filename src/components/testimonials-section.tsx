"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  company: string;
}

function TestimonialCard({ quote, name, role, company }: TestimonialCardProps) {
  return (
    <div className="relative rounded-2xl">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={164}
        inactiveZone={0.01}
        borderWidth={3}
      />
      <Card
        className="h-full border border-black/10 bg-black/[0.03]"
        shadow="none"
      >
        <CardBody className="flex flex-col justify-between gap-6 p-6">
          <div>
            <Icon
              icon="solar:quote-up-square-bold"
              className="mb-3 h-8 w-8 text-primary/50"
            />
            <p className="text-sm leading-relaxed text-black/70">{quote}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
              {name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-black">{name}</p>
              <p className="text-xs text-black/50">
                {role}, {company}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function TestimonialsSection() {
  const t = useTranslations("testimonials");

  const testimonials = [
    {
      quote: t("t1.quote"),
      name: t("t1.name"),
      role: t("t1.role"),
      company: t("t1.company"),
    },
    {
      quote: t("t2.quote"),
      name: t("t2.name"),
      role: t("t2.role"),
      company: t("t2.company"),
    },
    {
      quote: t("t3.quote"),
      name: t("t3.name"),
      role: t("t3.role"),
      company: t("t3.company"),
    },
  ];

  return (
    <section
      id="testimonials"
      className="bg-[#F9F9F8] flex flex-col items-center rounded-2xl px-6 py-24 md:rounded-3xl md:py-32"
    >
      <span className="text-default-500 mb-4 text-sm font-medium uppercase tracking-wider">
        {t("label")}
      </span>
      <h2 className="mb-12 max-w-2xl text-center text-3xl font-bold text-black md:text-4xl">
        {t("title")}
      </h2>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>
    </section>
  );
}
