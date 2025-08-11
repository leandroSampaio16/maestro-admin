"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  AlertCircle,
  Loader2,
  Plus,
  Minus,
  Mail,
} from "lucide-react";
import { createAdminOrganization } from "@/features/admin/organizations/create/actions/create-admin-organization";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EmailInput {
  id: string;
  email: string;
}

interface FormData {
  name: string;
  maxMembers: string;
  initialEmails: EmailInput[];
}

export function CreateOrganizationForm() {
  const t = useTranslations("Admin");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    maxMembers: "50",
    initialEmails: [{ id: "1", email: "" }],
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

    const maxMembersNum = parseInt(formData.maxMembers);
    if (isNaN(maxMembersNum) || maxMembersNum < 1 || maxMembersNum > 1000) {
      newErrors.maxMembers = t("invalidMemberLimit");
    }

    // Validate at least one valid email
    const validEmails = formData.initialEmails.filter(item => item.email.trim() && isValidEmail(item.email));
    if (validEmails.length === 0) {
      toast.error(t("atLeastOneEmailRequired"));
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const validEmails = formData.initialEmails
        .filter(item => item.email.trim() && isValidEmail(item.email))
        .map(item => item.email.trim());

      const result = await createAdminOrganization({
        name: formData.name.trim(),
        maxMembers: parseInt(formData.maxMembers),
        initialEmails: validEmails,
      });

      if (result.success) {
        toast.success(t("organizationCreatedSuccess"));
        // Redirect to invites page to manage the initial members
        router.push("/organizations/invites");
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

  const handleInputChange = (field: keyof FormData, value: string | number | EmailInput[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addEmail = () => {
    const newEmail: EmailInput = {
      id: Math.random().toString(36).substr(2, 9),
      email: "",
    };
    setFormData(prev => ({
      ...prev,
      initialEmails: [...prev.initialEmails, newEmail]
    }));
  };

  const removeEmail = (id: string) => {
    if (formData.initialEmails.length > 1) {
      setFormData(prev => ({
        ...prev,
        initialEmails: prev.initialEmails.filter(email => email.id !== id)
      }));
    }
  };

  const updateEmail = (id: string, email: string) => {
    setFormData(prev => ({
      ...prev,
      initialEmails: prev.initialEmails.map(item => 
        item.id === id ? { ...item, email } : item
      )
    }));
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

      {/* Initial Members */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {t("initialMembers")} *
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          {t("initialMembersDescription")}
        </p>
        <div className="space-y-3">
          {formData.initialEmails.map((emailInput, index) => (
            <div key={emailInput.id} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={`${t("email")} ${index + 1}`}
                    value={emailInput.email}
                    onChange={(e) => updateEmail(emailInput.id, e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeEmail(emailInput.id)}
                disabled={formData.initialEmails.length === 1 || isLoading}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEmail}
            className="w-full"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("addEmail")}
          </Button>
        </div>
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
