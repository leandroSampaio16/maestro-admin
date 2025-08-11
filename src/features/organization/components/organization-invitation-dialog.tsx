import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendEmailInvite } from "../actions/send-email-invite";
import { useSession } from "@/lib/better-auth/auth-client";
import { Plus, UserPlus } from "lucide-react";

interface OrganizationInvitationDialogProps {
  organizationId: string;
  onInvitationSent?: () => void;
}

export function OrganizationInvitationDialog({
  organizationId,
  onInvitationSent,
}: OrganizationInvitationDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleSendEmailInvite = async (email: string) => {
    setLoading(true);
    try {
      const result = await sendEmailInvite(
        organizationId,
        email,
        session?.user?.id || "",
      );
      if (result.success) {
        toast.success("Email invite sent successfully");
        setEmail("");
        setOpen(false);
        onInvitationSent?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Failed to send email invite:", error);
      toast.error("Failed to send email invite");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Enter the email address of the user you want to invite to your
          organization.
        </DialogDescription>
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={() => handleSendEmailInvite(email)}
            disabled={loading || !email}
          >
            {loading ? "Sending..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
