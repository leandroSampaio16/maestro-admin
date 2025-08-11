"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Clock,
  MoreHorizontal,
  Pause,
  Archive,
  RefreshCw,
  Users,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  UserCheck,
  Crown,
} from "lucide-react";
import { getAllOrganizations } from "@/features/admin/organizations/manage/actions/get-all-organizations";
import { suspendOrganization } from "@/features/admin/organizations/manage/actions/suspend-organization";
import { archiveOrganization } from "@/features/admin/organizations/manage/actions/archive-organization";
import { transferOwnership } from "@/features/admin/organizations/manage/actions/transfer-ownership";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";

interface Organization {
  id: string;
  name: string;
  description?: string;
  status: "active" | "suspended" | "archived" | "pending_verification";
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  ownerEmail?: string;
}

interface TransferOwnershipDialog {
  open: boolean;
  organization: Organization | null;
  newOwnerEmail: string;
}

export function OrganizationsManagement() {
  const t = useTranslations("Admin");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const dateLocale = locale === "pt" ? pt : enUS;

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [suspendDialog, setSuspendDialog] = useState<{
    open: boolean;
    organization: Organization | null;
  }>({ open: false, organization: null });
  
  const [archiveDialog, setArchiveDialog] = useState<{
    open: boolean;
    organization: Organization | null;
  }>({ open: false, organization: null });
  
  const [transferDialog, setTransferDialog] = useState<TransferOwnershipDialog>({
    open: false,
    organization: null,
    newOwnerEmail: "",
  });

  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getAllOrganizations();
        if (result.success && result.data) {
          setOrganizations(result.data);
          setFilteredOrganizations(result.data);
        } else {
          setError(result.error || "Failed to fetch organizations");
        }
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Filter organizations based on search term and status
  useEffect(() => {
    let filtered = organizations;

    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(org => org.status === statusFilter);
    }

    setFilteredOrganizations(filtered);
  }, [organizations, searchTerm, statusFilter]);

  const handleSuspend = async () => {
    if (!suspendDialog.organization) return;

    setActionLoading(suspendDialog.organization.id);

    try {
      const result = await suspendOrganization(suspendDialog.organization.id);
      if (result.success) {
        toast.success(t("organizationSuspendedSuccess"));
        // Update organization status in state
        setOrganizations(prev => prev.map(org => 
          org.id === suspendDialog.organization!.id 
            ? { ...org, status: "suspended" as const }
            : org
        ));
        setSuspendDialog({ open: false, organization: null });
      } else {
        toast.error(result.error || t("organizationSuspendedError"));
      }
    } catch (error) {
      console.error("Error suspending organization:", error);
      toast.error(t("organizationSuspendedError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async () => {
    if (!archiveDialog.organization) return;

    setActionLoading(archiveDialog.organization.id);

    try {
      const result = await archiveOrganization(archiveDialog.organization.id);
      if (result.success) {
        toast.success(t("organizationArchivedSuccess"));
        // Update organization status in state
        setOrganizations(prev => prev.map(org => 
          org.id === archiveDialog.organization!.id 
            ? { ...org, status: "archived" as const }
            : org
        ));
        setArchiveDialog({ open: false, organization: null });
      } else {
        toast.error(result.error || t("organizationArchivedError"));
      }
    } catch (error) {
      console.error("Error archiving organization:", error);
      toast.error(t("organizationArchivedError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferDialog.organization || !transferDialog.newOwnerEmail) return;

    setActionLoading(transferDialog.organization.id);

    try {
      const result = await transferOwnership(
        transferDialog.organization.id,
        transferDialog.newOwnerEmail
      );
      if (result.success) {
        toast.success(t("ownershipTransferredSuccess"));
        // Update organization owner in state
        setOrganizations(prev => prev.map(org => 
          org.id === transferDialog.organization!.id 
            ? { ...org, ownerEmail: transferDialog.newOwnerEmail }
            : org
        ));
        setTransferDialog({ open: false, organization: null, newOwnerEmail: "" });
      } else {
        toast.error(result.error || t("ownershipTransferredError"));
      }
    } catch (error) {
      console.error("Error transferring ownership:", error);
      toast.error(t("ownershipTransferredError"));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Organization["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-primary text-white dark:bg-primary">
            {tCommon("active")}
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="secondary" className="bg-primary text-white dark:bg-primary">
            <Clock className="h-3 w-3 mr-1" />
            {tCommon("suspended")}
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="secondary" className="bg-primary text-white dark:bg-primary">
            <Archive className="h-3 w-3 mr-1" />
            {tCommon("archived")}
          </Badge>
        );
      case "pending_verification":
        return (
          <Badge variant="secondary" className="bg-primary text-white dark:bg-primary">
            {tCommon("pending")}
          </Badge>
        );
      default:
        return null;
    }
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

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t("filters")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchOrganizations")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses")}</SelectItem>
                  <SelectItem value="active">{tCommon("active")}</SelectItem>
                  <SelectItem value="suspended">{tCommon("suspended")}</SelectItem>
                  <SelectItem value="archived">{tCommon("archived")}</SelectItem>
                  <SelectItem value="pending_verification">{tCommon("pending")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Organizations List */}
        <div className="space-y-4">
          {filteredOrganizations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("noOrganizationsFound")}</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || statusFilter !== "all" 
                    ? t("noOrganizationsMatchFilter")
                    : t("noOrganizationsYet")
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrganizations.map((organization) => (
              <Card key={organization.id} className="w-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
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
                          {organization.ownerEmail && (
                            <div className="flex items-center gap-1">
                              <Crown className="h-4 w-4" />
                              <span>{organization.ownerEmail}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDistanceToNow(new Date(organization.createdAt), {
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
                          {organization.status === "active" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => setSuspendDialog({ open: true, organization })}
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                {t("suspendOrganization")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setArchiveDialog({ open: true, organization })}
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                {t("archiveOrganization")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => setTransferDialog({ 
                              open: true, 
                              organization, 
                              newOwnerEmail: "" 
                            })}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            {t("transferOwnership")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendDialog.open} onOpenChange={(open) => 
        setSuspendDialog({ open, organization: suspendDialog.organization })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("suspendOrganizationTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("suspendOrganizationConfirm", { name: suspendDialog.organization?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              className="bg-yellow-600 text-white hover:bg-yellow-700"
              disabled={actionLoading === suspendDialog.organization?.id}
            >
              {actionLoading === suspendDialog.organization?.id ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t("suspending")}
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  {t("suspendOrganization")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialog.open} onOpenChange={(open) => 
        setArchiveDialog({ open, organization: archiveDialog.organization })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("archiveOrganizationTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("archiveOrganizationConfirm", { name: archiveDialog.organization?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              className="bg-gray-600 text-white hover:bg-gray-700"
              disabled={actionLoading === archiveDialog.organization?.id}
            >
              {actionLoading === archiveDialog.organization?.id ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t("archiving")}
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  {t("archiveOrganization")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Ownership Dialog */}
      <Dialog open={transferDialog.open} onOpenChange={(open) => 
        setTransferDialog({ open, organization: transferDialog.organization, newOwnerEmail: "" })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("transferOwnershipTitle")}</DialogTitle>
            <DialogDescription>
              {t("transferOwnershipDescription", { name: transferDialog.organization?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("newOwnerEmail")}</label>
              <Input
                type="email"
                placeholder={t("enterNewOwnerEmail")}
                value={transferDialog.newOwnerEmail}
                onChange={(e) => setTransferDialog(prev => ({ 
                  ...prev, 
                  newOwnerEmail: e.target.value 
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransferDialog({ 
                open: false, 
                organization: null, 
                newOwnerEmail: "" 
              })}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleTransferOwnership}
              disabled={
                !transferDialog.newOwnerEmail || 
                actionLoading === transferDialog.organization?.id
              }
            >
              {actionLoading === transferDialog.organization?.id ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t("transferring")}
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  {t("transferOwnership")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
