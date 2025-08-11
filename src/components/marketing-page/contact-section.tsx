"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("Marketing.contact");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  return (
    <section id="contact" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-3xl font-bold md:text-5xl lg:text-6xl">
            Ready to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Automate
            </span>{" "}
            Your Entire Outreach Pipeline?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg text-balance">
            Start your free trial today and experience the complete automation
            from target profile definition to personalized campaign execution
            with MultiSector AI.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Get Started Today</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll set up your free trial
                  within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium"
                      >
                        {t("fullNameLabel")}
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        placeholder={t("namePlaceholder")}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium"
                      >
                        {t("emailLabel")}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        placeholder={t("emailPlaceholder")}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="mb-2 block text-sm font-medium"
                    >
                      {t("companyLabel")}
                    </label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      required
                      placeholder={t("companyPlaceholder")}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium"
                    >
                      {t("messageLabel")}
                    </label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder={t("messagePlaceholder")}
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        {t("submitting")}
                      </>
                    ) : (
                      <>
                        {t("submitButton")}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="mb-6 text-2xl font-bold">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="mt-1 mr-4 h-6 w-6 text-blue-500" />
                  <div>
                    <div className="font-semibold">Email Us</div>
                    <div className="text-muted-foreground">
                      hello@multisectorai.com
                    </div>
                    <div className="text-muted-foreground text-sm">
                      We respond within 2 hours
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="mt-1 mr-4 h-6 w-6 text-green-500" />
                  <div>
                    <div className="font-semibold">Call Us</div>
                    <div className="text-muted-foreground">
                      +1 (555) 123-4567
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Mon-Fri 9AM-6PM EST
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="mt-1 mr-4 h-6 w-6 text-purple-500" />
                  <div>
                    <div className="font-semibold">Visit Us</div>
                    <div className="text-muted-foreground">
                      123 Innovation Drive
                      <br />
                      San Francisco, CA 94105
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h4 className="mb-4 font-semibold">
                  Why Choose MultiSector AI?
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>14-day free trial with full access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>No setup fees or hidden costs</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>Cancel anytime, no questions asked</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
