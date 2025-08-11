import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		const response = NextResponse.json({ success: true });

		// Delete the pending_invite cookie by setting it to expire in the past
		response.cookies.set("pending_invite", "", {
			path: "/",
			expires: new Date(0),
			httpOnly: false, // Allow client-side access since it might have been set by JS
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});

		console.log("response", response.cookies.getAll());
		return response;
	} catch (error) {
		console.error("Failed to clear pending invite cookie:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to clear cookie" },
			{ status: 500 },
		);
	}
}
