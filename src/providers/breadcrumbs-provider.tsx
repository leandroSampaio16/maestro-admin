"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { House } from "lucide-react";

export interface BreadcrumbItem {
  label: React.ReactNode;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbContextType {
  items: BreadcrumbItem[];
  isLoading: boolean;
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  items: [],
  isLoading: true,
});

export const useBreadcrumb = () => useContext(BreadcrumbContext);

interface BreadcrumbProviderProps {
  children: ReactNode;
}

export function BreadcrumbProvider({ children }: BreadcrumbProviderProps) {
  const pathname = usePathname();
  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      setIsLoading(true);

      // Split the pathname and remove empty strings
      let pathSegments = pathname.split("/").filter(Boolean);

      // Remove locale if present as first segment
      if (pathSegments[0] === "pt" || pathSegments[0] === "en") {
        pathSegments = pathSegments.slice(1);
      }

      // If on /research (or /pt/research, /en/research, or just /), show only research
      if (
        pathSegments.length === 0 ||
        (pathSegments.length === 1 && pathSegments[0] === "research")
      ) {
        setItems([
          {
            label: <House className="h-4 w-4" />,
            href: "/research",
            isCurrentPage: true,
          },
        ]);
        setIsLoading(false);
        return;
      }

      const breadcrumbs: BreadcrumbItem[] = [
        {
          label: <House className="h-4 w-4" />,
          href: "/research",
          isCurrentPage: false,
        },
      ];

      // Start building the path from /research
      let currentPath = "/research";

      const routeLabels: Record<string, string> = {
        settings: "Settings",
        profile: "Profile",
        account: "Account",
        notifications: "Notifications",
      };

      // Build breadcrumbs for remaining path segments
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;

        breadcrumbs.push({
          label:
            routeLabels[segment] ||
            segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath,
          isCurrentPage: isLast,
        });
      });

      setItems(breadcrumbs);
      setIsLoading(false);
    };

    generateBreadcrumbs();
  }, [pathname]);

  return (
    <BreadcrumbContext.Provider value={{ items, isLoading }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}