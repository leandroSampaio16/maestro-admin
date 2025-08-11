"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/better-auth/auth-client";
import { cn } from "@/lib/utils";

interface GoogleSignInButtonProps {
	className?: string;
	variant?:
		| "default"
		| "outline"
		| "secondary"
		| "ghost"
		| "link"
		| "destructive";
	text?: string;
}

export function GoogleSignInButton({
	className,
	variant = "outline",
	text = "Continue with Google",
}: GoogleSignInButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const searchParams = useSearchParams();
	const invite = searchParams.get("invite");

	const handleGoogleSignIn = async () => {
		setIsLoading(true);

		try {
			if (invite) {
				document.cookie = `pending_invite=${invite}; path=/; max-age=3600; SameSite=Lax`;
			}

			await authClient.signIn.social(
				{
					provider: "google",
					callbackURL: "/menu",
				},
				{
					params: {
						id: "google",
					},
				},
			);
		} catch (error) {
			console.error("Google sign-in error:", error);
			toast.error("Failed to sign in with Google. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			type="button"
			variant={variant}
			className={cn("w-full", className)}
			onClick={handleGoogleSignIn}
			disabled={isLoading}
		>
			{isLoading ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<svg className="h-4 w-4" viewBox="0 0 24 24" aria-label="Google logo">
					<title>Google logo</title>
					<path
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						fill="#4285F4"
					/>
					<path
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						fill="#34A853"
					/>
					<path
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						fill="#FBBC05"
					/>
					<path
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						fill="#EA4335"
					/>
				</svg>
			)}
			<span className="ml-2">{text}</span>
		</Button>
	);
}
