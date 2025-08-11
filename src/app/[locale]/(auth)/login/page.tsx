import { LoginForm } from "@/features/auth/components/login-form";
import { AuthGradientBackground } from "@/components/auth-gradient-background";

export default async function Login() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-6">
      <AuthGradientBackground />
      <LoginForm />
    </div>
  );
}
