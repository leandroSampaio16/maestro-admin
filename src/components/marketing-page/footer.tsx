import React from "react";
import Image from "next/image";
import MultiSectorAILogo from "/public/icons/logo-dark.png";
import MultiSectorAILogoLight from "/public/icons/logo-light.png";

export function Footer() {
  return (
    <footer className="border-border/50 bg-background border-t py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <Image
                src={MultiSectorAILogoLight}
                alt="MultiSector AI Logo"
                width={40}
                height={40}
                className="dark:hidden"
              />
              <Image
                src={MultiSectorAILogo}
                alt="MultiSector AI Logo"
                width={40}
                height={40}
                className="hidden dark:block"
              />
              <span className="text-xl font-bold">Maestro AI</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Automating the complete lead-to-campaign pipeline with intelligent
              filtering, enrichment, and personalized outreach.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Product</h4>
            <ul className="text-muted-foreground space-y-2">
              <li>
                <a
                  href="#features"
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#demo"
                  className="hover:text-foreground transition-colors"
                >
                  Demo
                </a>
              </li>
              <li className="hover:text-foreground cursor-pointer transition-colors">
                API Documentation
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="text-muted-foreground space-y-2">
              <li className="hover:text-foreground cursor-pointer transition-colors">
                About Us
              </li>
              <li className="hover:text-foreground cursor-pointer transition-colors">
                Careers
              </li>
              <li className="hover:text-foreground cursor-pointer transition-colors">
                Blog
              </li>
              <li className="hover:text-foreground cursor-pointer transition-colors">
                Press
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="text-muted-foreground space-y-2">
              <li className="hover:text-foreground cursor-pointer transition-colors">
                Help Center
              </li>
              <li className="hover:text-foreground cursor-pointer transition-colors">
                Contact Support
              </li>
              <li className="hover:text-foreground cursor-pointer transition-colors">
                Privacy Policy
              </li>
              <li className="hover:text-foreground cursor-pointer transition-colors">
                Terms of Service
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border/50 text-muted-foreground mt-8 border-t pt-8 text-center">
          <p>&copy; 2025 MultiSector AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
