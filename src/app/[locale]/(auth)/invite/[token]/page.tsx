import { InviteAcceptanceDialog } from "@/features/organization/components/invite-acceptance-dialog";
import { findValidInvite } from "@/features/organization/actions/get-valid-invite";

interface InvitePageProps {
	params: Promise<{
		token: string;
		locale: string;
	}>;
	searchParams: Promise<{
		email?: string;
	}>;
}

export default async function InvitePage({
	params,
	searchParams,
}: InvitePageProps) {
	const { token } = await params;
	const { email } = await searchParams;

	if (!email) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-4">
						Invalid Invite
					</h1>
					<p className="text-gray-600">
						This invite link appears to be incomplete. Please check your email
						for the correct link.
					</p>
				</div>
			</div>
		);
	}

	const invite = await findValidInvite(token, email);

	if (!invite) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-destructive mb-4">
						Invalid or Expired Invite
					</h1>
					<p className="text-gray-600">
						This invite is either invalid, expired, or has already been used.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<InviteAcceptanceDialog invite={invite} />
		</div>
	);
}
