"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  Settings,
  ChevronDown,
  BarChart3,
  Archive,
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

interface AdminUsersNavDropdownProps {
  isExpanded?: boolean;
}

export function AdminUsersNavDropdown({ isExpanded = true }: AdminUsersNavDropdownProps) {
  const t = useTranslations("Navigation");
  const tAdmin = useTranslations("Admin");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Check if any users route is active
  const isUsersRouteActive = React.useMemo(() => {
    return pathname.startsWith("/users");
  }, [pathname]);

  React.useEffect(() => {
    if (isUsersRouteActive) {
      setIsOpen(true);
    }
  }, [isUsersRouteActive]);

  const usersRoutes = [
    {
      title: tAdmin("userOverviewTitle"),
      url: "/users",
      icon: BarChart3,
      description: tAdmin("userOverviewDescription"),
    },
    {
      title: tAdmin("manageUsers"),
      url: "/users/manage",
      icon: Users,
      description: tAdmin("manageUsersDescription"),
    },
    {
      title: tAdmin("createUser"),
      url: "/users/create",
      icon: UserPlus,
      description: tAdmin("createUserDescription"),
    },
    {
      title: tAdmin("archivedUsers"),
      url: "/users/archived",
      icon: Archive,
      description: tAdmin("archivedUsersDescription"),
    },
  ];

  return (
    <SidebarMenuItem>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={tAdmin("userManagement")}
            className={cn(
              "w-full justify-between",
              isUsersRouteActive && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{tAdmin("userManagement")}</span>
            </div>
            {isExpanded && (
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <SidebarMenuSub>
            {usersRoutes.map((route) => {
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
