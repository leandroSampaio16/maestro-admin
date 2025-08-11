import { SignUpForm } from "@/features/auth/components/signup-form";
import { AuthGradientBackground } from "@/components/auth-gradient-background";

export default async function SignUp() {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center p-6">
      <AuthGradientBackground />
      <SignUpForm />
    </div>
  );
}
