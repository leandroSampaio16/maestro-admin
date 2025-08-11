"use client";

import { useEffect, useState } from "react";
import { useOrganizationStore } from "@/stores/organization-store";
// Removed cookie-based current organization usage
import { getUserOrganizations } from "@/features/organization/actions/get-user-organizations";
import { switchOrganization } from "@/features/organization/actions/switch-organization";
import { getOrganizationMembers } from "@/features/organization/actions/get-organization-members";
import { getOrganizationInvitations } from "@/features/organization/actions/get-organization-invitations";
import { OrganizationInfo } from "./organization-info";
import { OrganizationMembers } from "./organization-members";
import { OrganizationSwitcher } from "./organization-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

type OrganizationInvitation = {
  id: string;
  token: string;
  email: string;
  organizationId: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
  invitedBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export function OrganizationManagement() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    selectedOrganization,
    userOrganizations,
    isLoading,
    setSelectedOrganization,
    setUserOrganizations,
    setLoading,
  } = useOrganizationStore();

  // Initialize organizations and current organization
  useEffect(() => {
    const initializeOrganizations = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get all user organizations
        const userOrgsResult = await getUserOrganizations();
        if (userOrgsResult.success && userOrgsResult.data) {
          setUserOrganizations(
            userOrgsResult.data.map((item) => item.organization),
          );
          // If no selected org, pick the first
          if (!selectedOrganization && userOrgsResult.data.length) {
            setSelectedOrganization(userOrgsResult.data[0].organization);
          }
        }
      } catch (error) {
        console.error("Failed to initialize organizations:", error);
        setError("Failed to load organization data");
      } finally {
        setLoading(false);
      }
    };

    initializeOrganizations();
  }, [setSelectedOrganization, setUserOrganizations, setLoading]);

  // Load members and invitations when organization changes
  useEffect(() => {
    const loadMembersAndInvitations = async () => {
      if (!selectedOrganization) return;

      setIsLoadingMembers(true);
      try {
        // Load members and invitations in parallel
        const [membersResult, invitationsResult] = await Promise.all([
          getOrganizationMembers(selectedOrganization.id),
          getOrganizationInvitations(selectedOrganization.id),
        ]);

        if (membersResult.success && membersResult.data) {
          setMembers(membersResult.data);
        } else {
          toast.error("Failed to load organization members");
        }

        if (invitationsResult.success && invitationsResult.data) {
          setInvitations(invitationsResult.data);
        } else {
          console.warn("Failed to load invitations:", invitationsResult.error);
          // Don't show error toast for invitations as it's not critical
        }
      } catch (error) {
        console.error("Failed to load members and invitations:", error);
        toast.error("Failed to load organization data");
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembersAndInvitations();
  }, [selectedOrganization]);

  const handleOrganizationSwitch = async (organizationId: string) => {
    try {
      const result = await switchOrganization(organizationId);
      if (result.success && result.data) {
        setSelectedOrganization(result.data.organization);
        toast.success("Organization switched successfully");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Failed to switch organization:", error);
      toast.error("Failed to switch organization");
    }
  };

  const handleMemberRemoved = () => {
    // Reload members after removal
    if (selectedOrganization) {
      getOrganizationMembers(selectedOrganization.id).then((result) => {
        if (result.success && result.data) {
          setMembers(result.data);
        }
      });
    }
  };

  const handleInvitationSent = () => {
    // Reload invitations after sending
    if (selectedOrganization) {
      getOrganizationInvitations(selectedOrganization.id).then((result) => {
        if (result.success && result.data) {
          setInvitations(result.data);
        }
      });
    }
  };

  const handleOrganizationDeleted = () => {
    // Refresh the page or redirect after organization deletion
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!selectedOrganization) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No organization selected. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Title and Organization Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your organization settings, members, and preferences.
          </p>
        </div>
        {/* Organization Switcher - only show if user has multiple orgs */}
        {userOrganizations.length > 1 && (
          <div className="flex-shrink-0">
            <OrganizationSwitcher
              organizations={userOrganizations}
              selectedOrganization={selectedOrganization}
              onOrganizationSwitch={handleOrganizationSwitch}
            />
          </div>
        )}
      </div>

      {/* Organization Information */}
      <OrganizationInfo
        organization={selectedOrganization}
        onOrganizationDeleted={handleOrganizationDeleted}
        canDelete={userOrganizations.length > 1}
      />

      {/* Organization Members */}
      <OrganizationMembers
        members={members}
        invitations={invitations}
        isLoading={isLoadingMembers}
        organizationId={selectedOrganization.id}
        onMemberRemoved={handleMemberRemoved}
        onInvitationSent={handleInvitationSent}
      />
    </div>
  );
}
