"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { acceptInviteForExistingUser } from "../actions/accept-invite-existing-user";

interface InviteAcceptanceDialogProps {
	invite: {
		id: string;
		token: string;
		email: string;
		organizationId: string;
		status: string;
		expiresAt: string;
		createdAt: string;
		organizationName: string;
	};
}

export function InviteAcceptanceDialog({
	invite,
}: InviteAcceptanceDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleAccept = async () => {
		setIsLoading(true);
		try {
			const result = await acceptInviteForExistingUser(
				invite.token,
				invite.email,
			);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success(`Successfully joined ${invite.organizationName}!`);
				router.push("/menu");
			}
		} catch (error) {
			toast.error("Failed to accept invite. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleReject = () => {
		toast.info("Invite declined");
		router.push("/");
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Organization Invite</CardTitle>
				<CardDescription>
					You have been invited to join{" "}
					<strong>{invite.organizationName}</strong>.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<p className="text-sm text-gray-600">
						<strong>Organization:</strong> {invite.organizationName}
					</p>
					<p className="text-sm text-gray-600">
						<strong>Email:</strong> {invite.email}
					</p>
					<p className="text-sm text-gray-600">
						<strong>Expires:</strong>{" "}
						{new Date(invite.expiresAt).toLocaleDateString()}
					</p>
				</div>
			</CardContent>
			<CardFooter className="flex gap-2">
				<Button
					onClick={handleReject}
					variant="outline"
					className="flex-1"
					disabled={isLoading}
				>
					Decline
				</Button>
				<Button onClick={handleAccept} className="flex-1" disabled={isLoading}>
					{isLoading ? "Accepting..." : "Accept"}
				</Button>
			</CardFooter>
		</Card>
	);
}
