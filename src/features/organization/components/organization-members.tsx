"use client";

import { useState } from "react";
import {
  Users,
  UserX,
  Mail,
  Calendar,
  MoreHorizontal,
  Clock,
  X,
} from "lucide-react";
import { removeOrganizationMember } from "@/features/organization/actions/remove-organization-member";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useSession } from "@/lib/better-auth/auth-client";
import { sendEmailInvite } from "../actions/send-email-invite";
import { OrganizationInvitationDialog } from "./organization-invitation-dialog";

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

interface OrganizationMembersProps {
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
  isLoading: boolean;
  organizationId: string;
  onMemberRemoved: () => void;
  onInvitationSent: () => void;
}

export function OrganizationMembers({
  members,
  invitations,
  isLoading,
  organizationId,
  onMemberRemoved,
  onInvitationSent,
}: OrganizationMembersProps) {
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleRemoveMember = async (userIdToRemove: string) => {
    setRemovingMemberId(userIdToRemove);
    try {
      const result = await removeOrganizationMember(
        organizationId,
        userIdToRemove,
      );
      if (result.success) {
        toast.success("Member removed successfully");
        onMemberRemoved();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Users className="text-muted-foreground h-5 w-5" />
          <CardTitle>Organization Members</CardTitle>
          {!isLoading && (
            <>
              <Badge variant="secondary">{members.length} member(s)</Badge>
              {invitations.filter((inv) => inv.status === "pending").length >
                0 && (
                <Badge variant="outline">
                  {invitations.filter((inv) => inv.status === "pending").length}{" "}
                  pending
                </Badge>
              )}
            </>
          )}
        </div>
        <OrganizationInvitationDialog
          organizationId={organizationId}
          onInvitationSent={onInvitationSent}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : members.length === 0 && invitations.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              No members or invitations found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile view */}
            <div className="block space-y-4 md:hidden">
              {/* Pending Invitations */}
              {invitations
                .filter((inv) => inv.status === "pending")
                .map((invitation) => (
                  <Card
                    key={`invitation-${invitation.id}`}
                    className="border-dashed p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            <Mail className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          </div>
                          <div className="text-muted-foreground flex items-center text-sm">
                            <Calendar className="mr-1 h-3 w-3" />
                            Invited {formatDate(invitation.createdAt)}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            by{" "}
                            {invitation.invitedBy.name ||
                              invitation.invitedBy.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

              {/* Members */}
              {members.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={member.user.image || undefined}
                          alt={member.user.name || "User"}
                        />
                        <AvatarFallback>
                          {getInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.user.name || "Unknown User"}
                          {member.userId === session?.user?.id && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              You
                            </Badge>
                          )}
                        </p>
                        <div className="text-muted-foreground flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {member.user.email}
                        </div>
                        <div className="text-muted-foreground flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3" />
                          Joined {formatDate(member.joinedAt)}
                        </div>
                      </div>
                    </div>
                    {member.userId !== session?.user?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove{" "}
                              {member.user.name || member.user.email} from this
                              organization? They will lose access to all
                              organization data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.userId)}
                              disabled={removingMemberId === member.userId}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {removingMemberId === member.userId
                                ? "Removing..."
                                : "Remove Member"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop view */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Pending Invitations */}
                  {invitations
                    .filter((inv) => inv.status === "pending")
                    .map((invitation) => (
                      <TableRow
                        key={`invitation-${invitation.id}`}
                        className="border-dashed"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                <Mail className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{invitation.email}</p>
                              <p className="text-muted-foreground text-sm">
                                Invited by{" "}
                                {invitation.invitedBy.name ||
                                  invitation.invitedBy.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invitation.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invitation.createdAt)}
                        </TableCell>
                        <TableCell>
                          {/* Could add actions for resending/canceling invitations */}
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Members */}
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={member.user.image || undefined}
                              alt={member.user.name || "User"}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user.name || "Unknown User"}
                            </p>
                            {member.userId === session?.user?.id && (
                              <Badge variant="outline" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{member.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(member.joinedAt)}
                      </TableCell>
                      <TableCell>
                        {member.userId !== session?.user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Remove from organization
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Remove Member
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove{" "}
                                      {member.user.name || member.user.email}{" "}
                                      from this organization? They will lose
                                      access to all organization data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleRemoveMember(member.userId)
                                      }
                                      disabled={
                                        removingMemberId === member.userId
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {removingMemberId === member.userId
                                        ? "Removing..."
                                        : "Remove Member"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
