"use client";

import { useEffect } from "react";

export function ClearPendingInvite() {
	useEffect(() => {
		// Clear pending invite cookie on client side
		const clearCookie = async () => {
			try {
				await fetch("/api/clear-pending-invite", {
					method: "POST",
				});
			} catch (error) {
				console.error("Failed to clear pending invite cookie:", error);
			}
		};

		clearCookie();
	}, []);

	return null; // This component doesn't render anything
}
