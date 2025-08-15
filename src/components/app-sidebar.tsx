"use client";

import * as React from "react";
import {
  Search,
  Building2,
  BarChart3,
  Settings2,
  FileSliders,
  Users,
} from "lucide-react";
import { AdminNavDropdown } from "@/components/admin-nav-dropdown";
import { AdminUsersNavDropdown } from "@/components/admin-users-nav-dropdown";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import AugustaLabsLogoLight from "/public/icons/logo-light.png";
import AugustaLabsLogoDark from "/public/icons/logo-dark.png";
import Image from "next/image";
import { authClient } from "@/lib/better-auth/auth-client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { SidebarOrgSelector } from "@/components/sidebar-org-selector";

function AppHeader({
  state,
  theme,
}: {
  state: "expanded" | "collapsed";
  theme: string | undefined;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem
        className={cn("flex items-center gap-2", state === "expanded" && "p-2")}
      >
        <Image
          src={theme === "light" ? AugustaLabsLogoLight : AugustaLabsLogoDark}
          alt="Augusta Labs Logo"
          width={32}
          priority
          height={32}
        />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">Maestro AI</span>
          <span className="truncate text-xs">
            {useTranslations("Auth")("findAnyLeadWithAI")}
          </span>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function SimpleNavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ElementType;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {useTranslations("Common")("platform")}
      </SidebarGroupLabel>
      <SidebarMenu>
        {/* Admin Dropdown for Organizations */}
        <AdminNavDropdown />
        
        {/* Admin Dropdown for Users */}
        <AdminUsersNavDropdown />
        
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={pathname === item.url}
              asChild
            >
              {item.url === "#" ? (
                <div>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </div>
              ) : (
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// Navigation data structure - titles will be translated dynamically
const getNavigationData = (t: any) => ({
  navMain: [
    {
      title: t("settings"),
      url: "/settings",
      icon: Settings2,
    },
  ],
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations("Sidebar.navigation");
  const pathname = usePathname();

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const tCommon = useTranslations("Common");

  const userData = session?.user
    ? {
        name: session.user.name || tCommon("user"),
        email: session.user.email || "",
        avatar: session.user.image || undefined,
        initials: getInitials(session.user.name || tCommon("user")),
      }
    : {
        name: tCommon("loading"),
        email: "",
        avatar: undefined,
        initials: "LD",
      };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppHeader theme={theme} state={state} />
      </SidebarHeader>
      <SidebarContent>
        <SimpleNavMain 
          items={getNavigationData(t).navMain}
        />
      </SidebarContent>
      <SidebarFooter>
        <SidebarOrgSelector />
        <div className="mx-2">
          <SidebarSeparator />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
