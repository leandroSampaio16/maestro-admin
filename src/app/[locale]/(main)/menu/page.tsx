import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/better-auth/auth";
import { acceptInvite } from "@/features/organization/actions/accept-invite";
import { findValidInvite } from "@/features/organization/actions/get-valid-invite";


import { ClearPendingInvite } from "@/components/clear-pending-invite";

interface SearchParams {
	join?: string;
}

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	// Get user session using server-side auth
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	// Await searchParams before using
	const params = await searchParams;

	// Handle organization invite if present
	if (params.join) {
		try {
			const pendingInvite = await findValidInvite(
				params.join,
				session.user.email,
			);

			if (pendingInvite) {
				console.log(
					`User ${session.user.id} accepting invite to org ${pendingInvite.organizationId}`,
				);
				await acceptInvite(pendingInvite.id, session.user.id);
				console.log(
					`Successfully added user ${session.user.name} to organization ${pendingInvite.organizationId}`,
				);

                // Organization selection will be handled by client store initializer

				// Redirect to remove the join parameter from URL
				redirect("/admin/organizations/manage");
			}
            
		} catch (error) {
			console.error("Failed to process invite:", error);
            redirect("/admin/organizations/manage");
		}
	}
    else {
        redirect("/admin/organizations/manage");
    }

	return (
		<>
			<ClearPendingInvite />
			
		</>
	);
}