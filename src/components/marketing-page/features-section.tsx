"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Target,
  Zap,
  BarChart3,
  Globe,
  Shield,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  metrics?: string;
}

const features: Feature[] = [
  {
    icon: <Brain className="h-8 w-8 text-blue-500" />,
    title: "Deterministic Lead Filtering",
    description:
      "Define precise target profiles with advanced filters for company size, industry, technology stack, and behavioral triggers.",
    metrics: "50+ filter criteria",
  },
  {
    icon: <Target className="h-8 w-8 text-green-500" />,
    title: "AI-Powered Enrichment",
    description:
      "Automatically enrich lead profiles with contact information, company insights, and personalization data points.",
    metrics: "95% data accuracy",
  },
  {
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    title: "NLP Message Generation",
    description:
      "Create highly personalized outreach messages using natural language processing and contextual AI.",
    metrics: "3x response rates",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
    title: "Campaign Automation",
    description:
      "Execute multi-channel outreach campaigns with automated follow-ups and performance tracking.",
    metrics: "80% time saved",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-3xl font-bold md:text-5xl lg:text-6xl">
            Complete Lead-to-Campaign{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Automation
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg text-balance">
            From defining your ideal customer profile to executing personalized
            outreach campaigns - our platform automates every step of your lead
            generation and contact process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border-border/50 h-full rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="mb-2 text-xl">
                    {feature.title}
                  </CardTitle>
                  {feature.metrics && (
                    <Badge variant="secondary" className="w-fit">
                      {feature.metrics}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Globe className="mx-auto mb-4 h-12 w-12 text-blue-500" />
            <h3 className="mb-2 text-xl font-semibold">Profile Definition</h3>
            <p className="text-muted-foreground">
              Define your ideal customer profiles with precision using our
              advanced filtering system.
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Shield className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h3 className="mb-2 text-xl font-semibold">Smart Enrichment</h3>
            <p className="text-muted-foreground">
              Automatically enrich leads with contact details, company insights,
              and personalization data.
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Users className="mx-auto mb-4 h-12 w-12 text-purple-500" />
            <h3 className="mb-2 text-xl font-semibold">Automated Outreach</h3>
            <p className="text-muted-foreground">
              Execute personalized campaigns with AI-generated messages and
              automated follow-ups.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
