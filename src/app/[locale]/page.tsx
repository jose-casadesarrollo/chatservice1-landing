import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import HowItWorksSection from "@/components/how-it-works-section";
import TestimonialsSection from "@/components/testimonials-section";
import PricingSection from "@/components/pricing-section";
import FaqSection from "@/components/faq-section";
import CtaSection from "@/components/cta-section";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-black relative flex min-h-dvh w-full flex-col gap-9 overflow-y-auto p-4 md:gap-12 md:px-10 md:py-[34px]">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}
