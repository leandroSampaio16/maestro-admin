"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useOrganizationStore } from "@/stores/organization-store";
// Removed cookie-based current organization usage
import { getUserOrganizations } from "@/features/organization/actions/get-user-organizations";
import { switchOrganization } from "@/features/organization/actions/switch-organization";
import { Organization } from "@/db/schema/organizations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SidebarOrgSelector() {
  const router = useRouter();
  const { state } = useSidebar();
  const t = useTranslations("Organization");
  const tCommon = useTranslations("Common");
  const {
    selectedOrganization,
    userOrganizations,
    isLoading,
    isSwitching,
    setSelectedOrganization,
    setUserOrganizations,
    setLoading,
    setSwitching,
  } = useOrganizationStore();

  const [mounted, setMounted] = useState(false);

  // Initialize organization data
  useEffect(() => {
    const initializeOrganizations = async () => {
      setLoading(true);

      try {
        // Get all user organizations
        const userOrgsResult = await getUserOrganizations();

        // If no selected org in store, pick the first available
        if (!selectedOrganization && userOrgsResult.success && userOrgsResult.data?.length) {
          setSelectedOrganization(userOrgsResult.data[0].organization);
        }

        if (userOrgsResult.success && userOrgsResult.data) {
          setUserOrganizations(
            userOrgsResult.data.map((item) => item.organization),
          );
        }
      } catch (error) {
        console.error("Failed to initialize organizations:", error);
        toast.error(t("failedToLoad"));
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };

    initializeOrganizations();
  }, [selectedOrganization, setSelectedOrganization, setUserOrganizations, setLoading]);

  const handleOrganizationSwitch = async (organizationId: string) => {
    if (organizationId === selectedOrganization?.id) return;

    setSwitching(true);

    try {
      const result = await switchOrganization(organizationId);

      if (result.success && result.data) {
        setSelectedOrganization(result.data.organization);
        toast.success(t("switchedTo", { name: result.data.organization.name }));

        // Refresh the page to update organization-specific data
        router.refresh();
      } else {
        toast.error(result.error || t("failedToSwitch"));
      }
    } catch (error) {
      console.error("Failed to switch organization:", error);
      toast.error(t("failedToSwitch"));
    } finally {
      setSwitching(false);
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <SidebarGroup className="overflow-x-hidden">
        <SidebarGroupContent>
          <div className="flex items-center space-x-2 px-3 py-2">
            <Building2 className="text-muted-foreground h-4 w-4" />
            {state !== "collapsed" && (
              <div className="flex-1">
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              </div>
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup className="overflow-x-hidden">
        <SidebarGroupContent>
          <div className="flex items-center space-x-2 px-3 py-2">
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            {state !== "collapsed" && (
              <span className="text-muted-foreground text-sm">
                {tCommon("loading")}
              </span>
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  // Show empty state when no organizations are available
  if (!selectedOrganization || userOrganizations.length === 0) {
    return (
      <SidebarGroup className="overflow-x-hidden">
        <SidebarGroupContent>
          <div className="flex items-center space-x-2 px-3 py-2">
            <Building2 className="text-muted-foreground h-4 w-4" />
            {state !== "collapsed" && (
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm font-medium">
                  {t("noOrganizations")}
                </span>
                <span className="text-muted-foreground text-xs">
                  {t("noOrganizationsDescription")}
                </span>
              </div>
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  // Unified selector styled like profile section for both collapsed and expanded states
  const orgSelector = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className={`h-auto w-full ${state === "collapsed" ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
              <Building2 className="text-foreground h-4 w-4" />
            </div>
            {state !== "collapsed" && (
              <div className="flex flex-col items-start">
                <span className="max-w-[120px] truncate text-sm font-medium">
                  {selectedOrganization.name}
                </span>
                <span className="text-muted-foreground max-w-[120px] truncate text-xs">
                  {t("currentOrganization")}
                </span>
              </div>
            )}
          </div>
          {state !== "collapsed" && (
            <ChevronUp className="text-muted-foreground h-4 w-4" />
          )}
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={state === "collapsed" ? "right" : "bottom"}
        align={state === "collapsed" ? "start" : "end"}
        className="w-56"
      >
        {userOrganizations.map((org: Organization) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleOrganizationSwitch(org.id)}
            disabled={isSwitching || org.id === selectedOrganization.id}
            className={org.id === selectedOrganization.id ? "bg-accent" : ""}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span>{org.name}</span>
            {org.id === selectedOrganization.id && (
              <span className="text-muted-foreground ml-auto text-xs">
                {t("current")}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Add tooltip only for collapsed state
  const selectorWithTooltip =
    state === "collapsed" ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{orgSelector}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{selectedOrganization.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      orgSelector
    );

  return (
    <SidebarMenu>
      <SidebarMenuItem>{selectorWithTooltip}</SidebarMenuItem>
    </SidebarMenu>
  );
}
