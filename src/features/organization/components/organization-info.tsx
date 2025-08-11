"use client";

import { useState } from "react";
import { Building2, Calendar, Trash2 } from "lucide-react";
import { deleteOrganization } from "@/features/organization/actions/delete-organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Organization } from "@/db/schema";

interface OrganizationInfoProps {
  organization: Organization;
  onOrganizationDeleted: () => void;
  canDelete: boolean;
}

export function OrganizationInfo({
  organization,
  onOrganizationDeleted,
  canDelete,
}: OrganizationInfoProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteOrganization = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteOrganization(organization.id);
      if (result.success) {
        toast.success(result.message);
        onOrganizationDeleted();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Failed to delete organization:", error);
      toast.error("Failed to delete organization");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Building2 className="text-muted-foreground h-5 w-5" />
          <CardTitle>Organization Information</CardTitle>
        </div>
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="size-9">
                <Trash2 className="h-4 w-4 text-white" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{organization.name}"? This
                  action cannot be undone and will permanently remove the
                  organization and all its data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteOrganization}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
                >
                  {isDeleting ? "Deleting..." : "Delete Organization"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-center">
              <span className="text-muted-foreground text-sm font-medium">
                Organization Name
              </span>
            </div>
            <p className="text-sm">{organization.name}</p>
          </div>

          <div className="space-y-2">
            <span className="text-muted-foreground text-sm font-medium">
              Created
            </span>

            <p className="text-sm">{formatDate(organization.createdAt)}</p>
          </div>

          <div className="space-y-2">
            <span className="text-muted-foreground text-sm font-medium">
              Organization ID
            </span>
            <p className="text-sm">{organization.id}</p>
          </div>

          <div className="space-y-2">
            <span className="text-muted-foreground text-sm font-medium">
              Last Updated
            </span>
            <p className="text-sm">{formatDate(organization.updatedAt)}</p>
          </div>
        </div>

        {!canDelete && (
          <div className="bg-muted mt-4 rounded-lg p-3">
            <p className="text-muted-foreground text-sm">
              <strong>Note:</strong> This is your only organization and cannot
              be deleted. You need at least one organization to use the
              platform.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
