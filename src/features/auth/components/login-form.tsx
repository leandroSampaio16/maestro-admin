"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import AugustaLabsLogo from "/public/icons/logo-light.png";
import AugustaLabsLogoDark from "/public/icons/logo-dark.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "@/features/auth/actions/signin";
import { GoogleSignInButton } from "./google-signin-button";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();
  const t = useTranslations("Auth");
  const locale = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await signIn(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        router.push(`/${locale}/organizations`);
      }
    } catch {
      toast.error(t("somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "border-border bg-card relative z-10 w-[410px] rounded-3xl border px-6 py-5 shadow-lg",
        className,
      )}
    >
      <div className="flex items-center justify-center">
        <div className="flex items-center">
          <Image
            src={AugustaLabsLogo}
            alt="Augusta Labs"
            width={60}
            height={65}
            priority
            className="dark:hidden"
          />
          <Image
            src={AugustaLabsLogoDark}
            alt="Augusta Labs"
            width={60}
            height={65}
            priority
            className="hidden dark:block"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-muted-foreground text-[16px] leading-[16px] font-normal tracking-[-0.32px]">
            {t("findAnyLeadWithAI")}
          </h1>
        </div>

        <GoogleSignInButton />

        <div className="my-2 flex w-full items-center">
          <hr className="border-border flex-grow border-t" />
          <span className="text-muted-foreground bg-card px-2 text-sm leading-6 font-medium tracking-[-0.28px]">
            {t("or")}
          </span>
          <hr className="border-border flex-grow border-t" />
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="space-y-6">
            <div className="space-y-[13px]">
              <label
                htmlFor="email"
                className="text-foreground block text-[14px] leading-[14px] font-medium tracking-[-0.28px]"
              >
                {t("emailLabel")}
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-input text-foreground placeholder:text-muted-foreground focus:border-ring focus-visible:border-ring h-[50px] w-full rounded-2xl border bg-transparent px-6 py-4 text-[14px] leading-[14px] font-normal tracking-[-0.28px] focus:ring-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-[13px]">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-foreground block text-[14px] leading-[14px] font-medium tracking-[-0.28px]"
                >
                  {t("passwordLabel")}
                </label>
              <Link
                href="/forgot-password"
                  className="text-muted-foreground hover:text-foreground text-right text-sm"
                >
                  {t("forgotYourPassword")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-input text-foreground placeholder:text-muted-foreground focus:border-ring focus-visible:border-ring h-[50px] w-full rounded-2xl border bg-transparent px-6 py-4 pr-12 text-[14px] leading-[14px] font-normal tracking-[-0.28px] focus:ring-0 focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-6 -translate-y-1/2 transform transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="text-black"
              />
              <span className="text-foreground text-[14px] leading-5 font-normal tracking-[-0.28px]">
                {t("rememberMyLogin")}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="h-[50px] w-full cursor-pointer rounded-2xl border border-[#090909] bg-[#090909] text-[14px] leading-[18.2px] font-bold text-white shadow-[0px_2px_5px_0px_rgba(20,88,201,0.17),inset_0px_2px_1px_0px_rgba(255,255,255,0.22),inset_0px_-2px_0.3px_0px_rgba(14,56,125,0.18)] hover:bg-[#090909]/90"
            >
              {isLoading ? t("loggingIn") : t("login")}
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground text-[14px] leading-[26px] font-normal tracking-[-0.28px]">
                {t("dontHaveAccount")}{" "}
              </span>
              <Link
                href={`/${locale}/signup`}
                className="text-foreground hover:text-foreground/80 text-[14px] leading-[26px] font-semibold tracking-[-0.28px] transition-colors"
              >
                {t("createAnAccount")}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
