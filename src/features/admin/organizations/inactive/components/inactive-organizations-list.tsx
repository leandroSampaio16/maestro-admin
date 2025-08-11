"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Archive,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getInactiveOrganizations } from "@/features/admin/organizations/inactive/actions/get-inactive-organizations";
import { reactivateOrganization } from "@/features/admin/organizations/inactive/actions/reactivate-organization";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";

interface InactiveOrganization {
  id: string;
  name: string;
  description?: string;
  status: "suspended" | "archived";
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
}

export function InactiveOrganizationsList() {
  const t = useTranslations("Admin");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const dateLocale = locale === "pt" ? pt : enUS;

  const [organizations, setOrganizations] = useState<InactiveOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);


  useEffect(() => {
    const fetchInactiveOrganizations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getInactiveOrganizations();
        if (result.success && result.data) {
          setOrganizations(result.data);
        } else {
          setError(result.error || "Failed to fetch inactive organizations");
        }
      } catch (err) {
        console.error("Error fetching inactive organizations:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInactiveOrganizations();
  }, []);

  const handleReactivate = async (organization: InactiveOrganization) => {
    setActionLoading(organization.id);

    try {
      const result = await reactivateOrganization(organization.id);
      if (result.success) {
        toast.success(t("organizationReactivatedSuccess"));
        // Remove from inactive list
        setOrganizations(prev => prev.filter(org => org.id !== organization.id));
      } else {
        toast.error(result.error || t("organizationReactivatedError"));
      }
    } catch (error) {
      console.error("Error reactivating organization:", error);
      toast.error(t("organizationReactivatedError"));
    } finally {
      setActionLoading(null);
    }
  };



  const getStatusBadge = (status: "suspended" | "archived") => {
    if (status === "suspended") {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          {tCommon("suspended")}
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
        <Archive className="h-3 w-3 mr-1" />
        {tCommon("archived")}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingSkeleton variant="card" count={4} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (organizations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("noInactiveOrganizations")}</h3>
          <p className="text-muted-foreground text-center">
            {t("noInactiveOrganizationsDesc")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {organizations.map((organization) => (
          <Card key={organization.id} className="w-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Archive className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{organization.name}</h3>
                      {getStatusBadge(organization.status)}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{organization.memberCount} {t("members")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {t("lastUpdated")} {formatDistanceToNow(new Date(organization.updatedAt), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </span>
                      </div>
                    </div>
                    {organization.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {organization.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Right Section - Actions */}
                <div className="flex items-center gap-3">
                  {organization.status === "suspended" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReactivate(organization)}
                      disabled={actionLoading === organization.id}
                      className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950"
                    >
                      <RefreshCw className={cn(
                        "h-4 w-4 mr-2",
                        actionLoading === organization.id && "animate-spin"
                      )} />
                      {t("reactivate")}
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={actionLoading === organization.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">

                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


    </>
  );
}
