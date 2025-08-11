"use client";

import * as React from "react";
import {
  Building2,
  BarChart3,
  Users,
  UserPlus,
  Archive,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface AdminNavDropdownProps {
  isExpanded?: boolean;
}

export function AdminNavDropdown({ isExpanded = true }: AdminNavDropdownProps) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Check if any admin route is active
  const isAdminRouteActive = React.useMemo(() => {
    return pathname.startsWith("/organizations");
  }, [pathname]);

  React.useEffect(() => {
    if (isAdminRouteActive) {
      setIsOpen(true);
    }
  }, [isAdminRouteActive]);

  const adminRoutes = [
    {
      title: t("overview"),
      url: "/organizations",
      icon: BarChart3,
      description: t("overviewDescription"),
    },
    {
      title: t("organizations"),
      url: "/organizations/manage",
      icon: Building2,
      description: t("organizationsDescription"),
    },
    {
      title: t("createOrganization"),
      url: "/organizations/create",
      icon: UserPlus,
      description: t("createOrganizationDescription"),
    },
    {
      title: t("inviteMembers"),
      url: "/organizations/invites",
      icon: Users,
      description: t("inviteMembersDescription"),
    },
    {
      title: t("inactiveOrganizations"),
      url: "/organizations/inactive",
      icon: Archive,
      description: t("inactiveOrganizationsDescription"),
    },
    {
      title: t("organizationSettings"),
      url: "/organizations/settings",
      icon: Settings,
      description: t("organizationSettingsDescription"),
    },
  ];

  return (
    <SidebarMenuItem>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={t("organizationManagement")}
            className={cn(
              "w-full justify-between",
              isAdminRouteActive && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{t("organizationManagement")}</span>
            </div>
            {isExpanded && (
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <SidebarMenuSub>
            {adminRoutes.map((route) => {
              const isActive = pathname === route.url;
              const Icon = route.icon;
              
              return (
                <SidebarMenuSubItem key={route.url}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      "group/item",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Link href={route.url}>
                      <Icon className="h-4 w-4" />
                      <span>{route.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
