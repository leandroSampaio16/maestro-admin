"use client";

import React from "react";
import { HeroSection } from "@/components/marketing-page/hero-section";
import {
  FeaturesSection,
  DemoSection,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  ContactSection,
  Footer,
} from "@/components/marketing-page";
import { authClient } from "@/lib/better-auth/auth-client";
import { useRouter } from "@/i18n/navigation";

const MaestroAILanding: React.FC = () => {
  return (
    <div
      className="bg-background text-foreground min-h-screen overflow-x-hidden"
      style={{ scrollBehavior: "smooth" }}
    >
      <HeroSection />

      <FeaturesSection />

      <DemoSection />

      <TestimonialsSection />

      <PricingSection />

      <FAQSection />

      <ContactSection />

      <Footer />
    </div>
  );
};

export default MaestroAILanding;
