"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$99",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 1,000 leads/month",
      "Basic profile filtering",
      "Standard enrichment",
      "Email campaigns",
      "Standard support",
    ],
  },
  {
    name: "Professional",
    price: "$299",
    description: "Ideal for growing businesses",
    features: [
      "Up to 5,000 leads/month",
      "Advanced deterministic filters",
      "AI-powered enrichment",
      "Multi-channel campaigns",
      "NLP message generation",
      "Priority support",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with specific needs",
    features: [
      "Unlimited leads",
      "Custom filtering logic",
      "Advanced NLP messaging",
      "White-label campaigns",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-3xl font-bold md:text-5xl lg:text-6xl">
            Simple,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg text-balance">
            Choose the plan that fits your business needs. All plans include our
            core AI features with 14-day free trial and no setup fees.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card
                className={`relative h-full rounded-2xl shadow-sm ${tier.popular ? "scale-105 border-blue-500 shadow-lg" : "border-border/50"}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4 text-4xl font-bold">
                    {tier.price}
                    {tier.price !== "Custom" && (
                      <span className="text-muted-foreground text-lg">
                        /month
                      </span>
                    )}
                  </div>
                  <CardDescription className="mt-2">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    asChild
                  >
                    <a href="#contact">
                      {tier.price === "Custom"
                        ? "Contact Sales"
                        : "Start Free Trial"}
                    </a>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-4">
            All plans include 24/7 support, data security, and regular feature
            updates
          </p>
          <Button variant="outline" asChild>
            <a href="#faq">
              View FAQ
              <ChevronDown className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
