"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Globe,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { createAdminOrganization } from "../actions/create-admin-organization";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  description: string;
  website: string;
  maxMembers: string;
  ownerId: string;
}

export function CreateOrganizationForm() {
  const t = useTranslations("Admin");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    website: "",
    maxMembers: "50",
    ownerId: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("nameRequired");
    } else if (formData.name.length < 2) {
      newErrors.name = t("nameMinLength");
    }

    if (!formData.ownerId.trim()) {
      newErrors.ownerId = t("ownerRequired");
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = t("invalidWebsite");
    }

    const maxMembersNum = parseInt(formData.maxMembers);
    if (isNaN(maxMembersNum) || maxMembersNum < 1 || maxMembersNum > 1000) {
      newErrors.maxMembers = t("invalidMemberLimit");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await createAdminOrganization({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        website: formData.website.trim() || undefined,
        maxMembers: parseInt(formData.maxMembers),
        ownerId: formData.ownerId.trim(),
      });

      if (result.success) {
        toast.success(t("organizationCreatedSuccess"));
        router.push("/organizations/manage");
      } else {
        toast.error(result.error || t("organizationCreatedError"));
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error(t("organizationCreatedError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organization Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          {t("organizationName")} *
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder={t("organizationNamePlaceholder")}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={cn(
              "pl-10",
              errors.name && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isLoading}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          {t("description")}
        </Label>
        <Textarea
          id="description"
          placeholder={t("descriptionPlaceholder")}
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          {t("descriptionOptional")}
        </p>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website" className="text-sm font-medium">
          {t("website")}
        </Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            className={cn(
              "pl-10",
              errors.website && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isLoading}
          />
        </div>
        {errors.website && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.website}
          </p>
        )}
      </div>

      {/* Owner ID */}
      <div className="space-y-2">
        <Label htmlFor="ownerId" className="text-sm font-medium">
          {t("ownerId")} *
        </Label>
        <div className="relative">
          <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="ownerId"
            type="text"
            placeholder={t("ownerIdPlaceholder")}
            value={formData.ownerId}
            onChange={(e) => handleInputChange("ownerId", e.target.value)}
            className={cn(
              "pl-10",
              errors.ownerId && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isLoading}
          />
        </div>
        {errors.ownerId && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.ownerId}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t("ownerIdDescription")}
        </p>
      </div>

      {/* Max Members */}
      <div className="space-y-2">
        <Label htmlFor="maxMembers" className="text-sm font-medium">
          {t("maxMembers")}
        </Label>
        <Select
          value={formData.maxMembers.toString()}
          onValueChange={(value) => handleInputChange("maxMembers", parseInt(value))}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 {t("members")}</SelectItem>
            <SelectItem value="25">25 {t("members")}</SelectItem>
            <SelectItem value="50">50 {t("members")}</SelectItem>
            <SelectItem value="100">100 {t("members")}</SelectItem>
            <SelectItem value="250">250 {t("members")}</SelectItem>
            <SelectItem value="500">500 {t("members")}</SelectItem>
            <SelectItem value="1000">1000 {t("members")}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t("maxMembersDescription")}
        </p>
      </div>

      {/* Status Preview */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t("initialStatus")}</p>
              <p className="text-xs text-muted-foreground">
                {t("initialStatusDescription")}
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              {tCommon("active")}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4 mr-2" />
              {t("createOrganization")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
