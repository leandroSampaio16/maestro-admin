import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Organization } from "@/db/schema";

interface OrganizationState {
  // Current selected organization
  selectedOrganization: Organization | null;

  // All organizations user has access to (for future multi-org support)
  userOrganizations: Organization[];

  // Loading states
  isLoading: boolean;
  isSwitching: boolean;
  isInitialized: boolean; // Track if data has been loaded at least once

  // Actions
  setSelectedOrganization: (organization: Organization) => void;
  setUserOrganizations: (organizations: Organization[]) => void;
  setLoading: (loading: boolean) => void;
  setSwitching: (switching: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  clearOrganizations: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      // Initial state
      selectedOrganization: null,
      userOrganizations: [],
      isLoading: false,
      isSwitching: false,
      isInitialized: false,

      // Actions
      setSelectedOrganization: (organization) =>
        set({ selectedOrganization: organization }),

      setUserOrganizations: (organizations) =>
        set({ userOrganizations: organizations }),

      setLoading: (loading) => set({ isLoading: loading }),

      setSwitching: (switching) => set({ isSwitching: switching }),

      setInitialized: (initialized) => set({ isInitialized: initialized }),

      clearOrganizations: () =>
        set({
          selectedOrganization: null,
          userOrganizations: [],
          isLoading: false,
          isSwitching: false,
          isInitialized: false,
        }),
    }),
    {
      name: "organization-store",
      // Only persist the organizations, not loading states
      partialize: (state) => ({
        selectedOrganization: state.selectedOrganization,
        userOrganizations: state.userOrganizations,
      }),
    },
  ),
);
