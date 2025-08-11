"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  UserPlus,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Search,
  Filter,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

// Import real actions
import { getAllInvites, type AdminInvite } from "@/features/admin/organizations/invites/actions/get-all-invites";
import { sendBulkInvites, type BulkInviteRequest } from "@/features/admin/organizations/invites/actions/send-bulk-invites";
import { cancelInvite } from "@/features/admin/organizations/invites/actions/cancel-invite";
import { resendInvite } from "@/features/admin/organizations/invites/actions/resend-invite";
import { getAllOrganizations, type Organization } from "@/features/admin/organizations/manage/actions/get-all-organizations";

interface EmailInput {
  id: string;
  email: string;
}

interface BulkInviteForm {
  organizationId: string;
  emails: EmailInput[];
  role: "admin" | "user";
  message: string;
}

function InviteStatusBadge({ status }: { status: AdminInvite["status"] }) {
  const variants = {
    pending: { variant: "secondary" as const, icon: Clock },
    accepted: { variant: "default" as const, icon: CheckCircle },
    expired: { variant: "destructive" as const, icon: XCircle },
  };

  const { variant, icon: Icon } = variants[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

function EmailInputList({
  emails,
  onChange,
}: {
  emails: EmailInput[];
  onChange: (emails: EmailInput[]) => void;
}) {
  const t = useTranslations("Admin");

  const addEmail = () => {
    const newEmail: EmailInput = {
      id: Math.random().toString(36).substr(2, 9),
      email: "",
    };
    onChange([...emails, newEmail]);
  };

  const removeEmail = (id: string) => {
    if (emails.length > 1) {
      onChange(emails.filter((email) => email.id !== id));
    }
  };

  const updateEmail = (id: string, email: string) => {
    onChange(
      emails.map((item) => (item.id === id ? { ...item, email } : item))
    );
  };

  return (
    <div className="space-y-3">
      {emails.map((emailInput, index) => (
        <div key={emailInput.id} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="email"
              placeholder={`Email ${index + 1}`}
              value={emailInput.email}
              onChange={(e) => updateEmail(emailInput.id, e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeEmail(emailInput.id)}
            disabled={emails.length === 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addEmail}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Email
      </Button>
    </div>
  );
}

function BulkInviteDialog({
  open,
  onOpenChange,
  organizations,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizations: Organization[];
  onSubmit: (form: BulkInviteForm) => void;
}) {
  const t = useTranslations("Admin");
  const [form, setForm] = useState<BulkInviteForm>({
    organizationId: "",
    emails: [{ id: "1", email: "" }],
    role: "user",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validEmails = form.emails.filter((item) => item.email.trim());
    if (!form.organizationId || validEmails.length === 0) {
      toast.error(t("bulkInviteValidationError"));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...form, emails: validEmails });
      setForm({ 
        organizationId: "", 
        emails: [{ id: "1", email: "" }], 
        role: "user", 
        message: "" 
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("sendBulkInvitesTitle")}</DialogTitle>
          <DialogDescription>{t("sendBulkInvitesDescription")}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization">{t("selectOrganization")}</Label>
            <Select
              value={form.organizationId}
              onValueChange={(value) => setForm({ ...form, organizationId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectOrganizationPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t("defaultRole")}</Label>
            <Select
              value={form.role}
              onValueChange={(value: "admin" | "user") => setForm({ ...form, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("emailAddresses")}</Label>
            <EmailInputList
              emails={form.emails}
              onChange={(emails) => setForm({ ...form, emails })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("sending") : t("sendInvites")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InviteActions({
  invite,
  onResend,
  onCancel,
}: {
  invite: AdminInvite;
  onResend: (invite: AdminInvite) => void;
  onCancel: (invite: AdminInvite) => void;
}) {
  const t = useTranslations("Admin");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {invite.status === "pending" && (
          <>
            <DropdownMenuItem onClick={() => onResend(invite)}>
              <Mail className="h-4 w-4 mr-2" />
              {t("resend")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCancel(invite)}>
              <XCircle className="h-4 w-4 mr-2" />
              {t("cancelInvite")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminInviteManagement() {
  const t = useTranslations("Admin");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [filteredInvites, setFilteredInvites] = useState<AdminInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");

  // Dialogs
  const [bulkInviteDialog, setBulkInviteDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    invite: AdminInvite | null;
  }>({ open: false, invite: null });

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [orgsResult, invitesResult] = await Promise.all([
          getAllOrganizations(),
          getAllInvites(),
        ]);

        if (orgsResult.success && orgsResult.data) {
          setOrganizations(orgsResult.data);
        } else {
          console.error("Failed to load organizations:", orgsResult.error);
        }

        if (invitesResult.success && invitesResult.data) {
          setInvites(invitesResult.data);
          setFilteredInvites(invitesResult.data);
        } else {
          setError(invitesResult.error || "Failed to load invites");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter invites based on search and filters
  useEffect(() => {
    let filtered = invites;

    if (searchTerm) {
      filtered = filtered.filter(
        (invite) =>
          invite.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invite.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((invite) => invite.status === statusFilter);
    }

    if (organizationFilter !== "all") {
      filtered = filtered.filter((invite) => invite.organizationId === organizationFilter);
    }

    setFilteredInvites(filtered);
  }, [invites, searchTerm, statusFilter, organizationFilter]);

  const handleBulkInvite = async (form: BulkInviteForm) => {
    try {
      const request: BulkInviteRequest = {
        organizationId: form.organizationId,
        emails: form.emails.map((item) => item.email),
        role: form.role,
        message: form.message || undefined,
      };

      const result = await sendBulkInvites(request);
      
      if (result.success && result.data) {
        toast.success(t("bulkInviteSuccess", { count: result.data.sent }));
        
        if (result.data.failed > 0) {
          toast.error(`${result.data.failed} invites failed to send`);
        }

        // Refresh invites list
        const invitesResult = await getAllInvites();
        if (invitesResult.success && invitesResult.data) {
          setInvites(invitesResult.data);
        }
      } else {
        toast.error(result.error || t("bulkInviteError"));
      }
    } catch (err) {
      console.error("Error sending bulk invites:", err);
      toast.error(t("bulkInviteError"));
    }
  };

  const handleResendInvite = async (invite: AdminInvite) => {
    try {
      const result = await resendInvite(invite.id);
      
      if (result.success) {
        toast.success(t("inviteResentSuccess"));
      } else {
        toast.error(result.error || t("inviteResentError"));
      }
    } catch (err) {
      console.error("Error resending invite:", err);
      toast.error(t("inviteResentError"));
    }
  };

  const handleCancelInvite = async (invite: AdminInvite) => {
    try {
      const result = await cancelInvite(invite.id);
      
      if (result.success) {
        // Remove from local state
        setInvites((prev) => prev.filter((i) => i.id !== invite.id));
        toast.success(t("inviteCancelledSuccess"));
      } else {
        toast.error(result.error || t("inviteCancelledError"));
      }
    } catch (err) {
      console.error("Error cancelling invite:", err);
      toast.error(t("inviteCancelledError"));
    } finally {
      setCancelDialog({ open: false, invite: null });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setOrganizationFilter("all");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-64" />
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-16" />
          ))}
        </div>
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

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <Button onClick={() => setBulkInviteDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t("sendBulkInvites")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("filtersAndActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">{t("searchInvites")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t("searchInvites")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Organization</Label>
              <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allOrganizations")}</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invites List */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations ({filteredInvites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvites.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("noInvitesFound")}</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || organizationFilter !== "all"
                  ? t("noInvitesMatchFilter")
                  : t("noInvitesYet")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {invite.organizationName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <InviteStatusBadge status={invite.status} />
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {t("invitedBy")} {invite.inviterEmail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <InviteActions
                      invite={invite}
                      onResend={handleResendInvite}
                      onCancel={(invite) => setCancelDialog({ open: true, invite })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Invite Dialog */}
      <BulkInviteDialog
        open={bulkInviteDialog}
        onOpenChange={setBulkInviteDialog}
        organizations={organizations}
        onSubmit={handleBulkInvite}
      />

      {/* Cancel Invite Dialog */}
      <AlertDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ open, invite: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelInviteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelInviteConfirm", { email: cancelDialog.invite?.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelDialog.invite && handleCancelInvite(cancelDialog.invite)}
            >
              {t("cancelInvite")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}