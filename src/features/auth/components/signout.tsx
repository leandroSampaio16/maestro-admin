"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/better-auth/auth-client";
import { useOrganizationStore } from "@/stores/organization-store";

function SignOut() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSignOut} disabled={isLoading}>
      {isLoading && <Loader2 className="animate-spin" />}
      Sign Out
    </Button>
  );
}

export default SignOut;
