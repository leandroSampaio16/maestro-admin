"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How does the lead identification and enrichment process work?",
    answer:
      "You start by defining your ideal customer profile using our deterministic filters. Our AI then identifies matching prospects and automatically enriches them with contact information, company insights, and personalization data points for targeted outreach.",
  },
  {
    question: "How does the automated messaging and campaign execution work?",
    answer:
      "Our NLP engine generates personalized messages based on enriched lead data and your campaign templates. The system then executes multi-channel outreach campaigns with automated follow-ups and tracks all interactions and responses.",
  },
  {
    question: "How quickly can I launch my first campaign?",
    answer:
      "You can define your target profile, enrich leads, and launch your first personalized outreach campaign within hours of setup. Most customers see responses within the first 24-48 hours of campaign execution.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! We offer a 14-day free trial with access to all Professional features. No credit card required to start.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="bg-background py-20">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-3xl font-bold md:text-5xl lg:text-6xl">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-muted-foreground text-lg text-balance">
            Get answers to common questions about MultiSector AI and our lead
            generation platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
