"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "VP of Sales",
    company: "TechFlow Solutions",
    content:
      "MultiSector AI completely automated our outreach process. From defining target profiles to executing campaigns, we've saved 80% of our time while tripling our response rates.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
  },
  {
    name: "Marcus Rodriguez",
    role: "Marketing Director",
    company: "GrowthLabs Inc",
    content:
      "The deterministic filtering and AI enrichment are game-changers. We're now reaching highly qualified prospects with personalized messages that actually get responses.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
  },
  {
    name: "Emily Watson",
    role: "CEO",
    company: "StartupBoost",
    content:
      "The complete automation from lead identification to campaign execution helped us scale our outreach without hiring additional sales staff. Our conversion rates improved by 250%.",
    rating: 5,
    avatar: "/api/placeholder/40/40",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-3xl font-bold md:text-5xl lg:text-6xl">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sales Teams
            </span>{" "}
            Worldwide
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg text-balance">
            Join thousands of companies that have transformed their lead
            generation and accelerated their growth with MultiSector AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border-border/50 h-full rounded-2xl shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-current text-yellow-500"
                      />
                    ))}
                  </div>
                  <blockquote className="mb-6 text-lg">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <Avatar className="mr-4 h-12 w-12">
                      <AvatarImage
                        src={testimonial.avatar}
                        alt={testimonial.name}
                      />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-2 text-3xl font-bold text-blue-500 md:text-4xl">
              5,000+
            </div>
            <div className="text-muted-foreground">Active Users</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-2 text-3xl font-bold text-green-500 md:text-4xl">
              2M+
            </div>
            <div className="text-muted-foreground">Leads Generated</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-2 text-3xl font-bold text-purple-500 md:text-4xl">
              340%
            </div>
            <div className="text-muted-foreground">Average ROI</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-2 text-3xl font-bold text-yellow-500 md:text-4xl">
              98%
            </div>
            <div className="text-muted-foreground">Customer Satisfaction</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
