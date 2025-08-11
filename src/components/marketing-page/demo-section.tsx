"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Target, Zap, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export function DemoSection() {
  return (
    <section id="demo" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-3xl font-bold md:text-5xl lg:text-6xl">
            See the Complete{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pipeline
            </span>{" "}
            in Action
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg text-balance">
            Watch how our platform takes you from target profile definition to
            automated outreach campaigns with intelligent filtering, enrichment,
            and personalized messaging.
          </p>
        </motion.div>

        <Tabs defaultValue="discovery" className="mx-auto max-w-4xl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discovery">Profile & Filtering</TabsTrigger>
            <TabsTrigger value="qualification">Enrichment</TabsTrigger>
            <TabsTrigger value="integration">Campaign Execution</TabsTrigger>
          </TabsList>

          <TabsContent value="discovery" className="mt-8">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-6 w-6 text-blue-500" />
                  Target Profile Definition & Filtering
                </CardTitle>
                <CardDescription>
                  Define your ideal customer profile and apply deterministic
                  filters to identify prospects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted mb-6 flex aspect-video items-center justify-center rounded-lg">
                  <Button size="lg" className="rounded-xl px-8 py-4 text-lg">
                    <Play className="mr-2 h-6 w-6" />
                    Play Demo Video
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">Real-time Processing</h4>
                    <Progress value={85} className="mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Processing 50,000+ data points per second
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Match Accuracy</h4>
                    <Progress value={94} className="mb-2" />
                    <p className="text-muted-foreground text-sm">
                      94% accuracy in lead qualification
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualification" className="mt-8">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-6 w-6 text-green-500" />
                  AI-Powered Lead Enrichment
                </CardTitle>
                <CardDescription>
                  Watch how we automatically enrich leads with contact data and
                  personalization insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted mb-6 flex aspect-video items-center justify-center rounded-lg">
                  <Button size="lg" className="rounded-xl px-8 py-4 text-lg">
                    <Play className="mr-2 h-6 w-6" />
                    View Qualification Process
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-semibold">Company Size Match</div>
                      <div className="text-muted-foreground text-sm">
                        500-1000 employees
                      </div>
                    </div>
                    <Badge className="bg-green-500">95% Match</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-semibold">Industry Relevance</div>
                      <div className="text-muted-foreground text-sm">
                        SaaS Technology
                      </div>
                    </div>
                    <Badge className="bg-blue-500">92% Match</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-semibold">Budget Indicator</div>
                      <div className="text-muted-foreground text-sm">
                        Recent funding round
                      </div>
                    </div>
                    <Badge className="bg-purple-500">88% Match</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="mt-8">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-6 w-6 text-yellow-500" />
                  Automated Campaign Execution
                </CardTitle>
                <CardDescription>
                  Execute personalized outreach campaigns with AI-generated
                  messages and follow-ups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted mb-6 flex aspect-video items-center justify-center rounded-lg">
                  <Button size="lg" className="rounded-xl px-8 py-4 text-lg">
                    <Play className="mr-2 h-6 w-6" />
                    See Integration Demo
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {["Salesforce", "HubSpot", "Pipedrive", "Mailchimp"].map(
                    (platform) => (
                      <div
                        key={platform}
                        className="rounded-lg border p-4 text-center"
                      >
                        <div className="bg-muted mx-auto mb-2 h-12 w-12 rounded-lg"></div>
                        <div className="font-medium">{platform}</div>
                        <CheckCircle className="mx-auto mt-1 h-4 w-4 text-green-500" />
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
