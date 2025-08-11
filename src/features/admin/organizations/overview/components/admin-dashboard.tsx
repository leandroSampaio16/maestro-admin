"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  AlertCircle,
  Building2,
  Mail,
  Users,
} from "lucide-react";
import { getAdminStats, type AdminStats } from "@/features/admin/organizations/overview/actions/get-admin-stats";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const t = useTranslations("Admin");
  const router = useRouter();
  
  const actions = [
    {
      title: t("createOrganization"),
      href: "/organizations/create",
    },
    {
      title: t("manageOrganizations"),
      href: "/organizations/manage",
    },
    {
      title: t("inviteMembers"),
      href: "/organizations/invites",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("quickActions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => router.push(action.href)}
              className="h-auto p-4 justify-start"
            >
              {action.title}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const t = useTranslations("Admin");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const result = await getAdminStats();
        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to fetch admin statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <LoadingSkeleton className="h-8 w-64" />
          <LoadingSkeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("noDataAvailable")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <QuickActions />

      {/* Essential Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title={t("totalOrganizations")}
          value={stats.totalOrganizations}
          icon={Building2}
        />
        <StatsCard
          title={t("totalMembers")}
          value={stats.totalMembers}
          icon={Users}
        />
        <StatsCard
          title={t("pendingInvites")}
          value={stats.pendingInvites}
          icon={Mail}
        />
      </div>
    </div>
  );
}