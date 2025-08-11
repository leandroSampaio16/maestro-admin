"use client";

import { Building2, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Organization } from "@/db/schema";

interface OrganizationSwitcherProps {
  organizations: Organization[];
  selectedOrganization: Organization;
  onOrganizationSwitch: (organizationId: string) => void;
}

export function OrganizationSwitcher({
  organizations,
  selectedOrganization,
  onOrganizationSwitch,
}: OrganizationSwitcherProps) {
  return (
    <div className="w-full sm:w-auto sm:min-w-[200px] sm:max-w-xs">
      <Select
        value={selectedOrganization.id}
        onValueChange={onOrganizationSwitch}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select organization" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              <span>{org.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}