"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Accordion, AccordionItem } from "@heroui/react";

export default function FaqSection() {
  const t = useTranslations("faq");

  const faqs = [
    { question: t("q1.question"), answer: t("q1.answer") },
    { question: t("q2.question"), answer: t("q2.answer") },
    { question: t("q3.question"), answer: t("q3.answer") },
    { question: t("q4.question"), answer: t("q4.answer") },
    { question: t("q5.question"), answer: t("q5.answer") },
    { question: t("q6.question"), answer: t("q6.answer") },
  ];

  return (
    <section
      id="faq"
      className="bg-[#F9F9F8] flex flex-col items-center rounded-2xl px-6 py-24 md:rounded-3xl md:py-32"
    >
      <span className="text-default-500 mb-4 text-sm font-medium uppercase tracking-wider">
        {t("label")}
      </span>
      <h2 className="mb-12 max-w-2xl text-center text-3xl font-bold text-black md:text-4xl">
        {t("title")}
      </h2>

      <div className="w-full max-w-3xl">
        <Accordion
          variant="splitted"
          itemClasses={{
            base: "border border-black/10 bg-black/[0.03] mb-3",
            title: "text-black font-medium",
            content: "text-black/60 text-sm pb-4",
            trigger: "px-5 py-4",
            indicator: "text-black/40",
          }}
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              aria-label={faq.question}
              title={faq.question}
            >
              {faq.answer}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
