"use server";

import { auth } from "@/lib/better-auth/auth";

export const signUp = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      query: {
        invite: (formData.get("invite") as string) || undefined,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    // Handle specific error messages from the API
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("Password too short")) {
      return {
        error: "Password must be at least 8 characters long.",
      };
    }

    if (
      errorMessage.includes("already exists") ||
      errorMessage.includes("duplicate")
    ) {
      return {
        error: "An account with this email already exists.",
      };
    }

    return {
      error: "Failed to create account. Please try again.",
    };
  }
};
