import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Types based on your API schema
export type UserRole = "manager" | "general";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  oneSignalId: string;
  image?: {
    id: string;
    name: string;
    url: string;
  } | null;
  customerId?: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setHydrated: (state: boolean) => void;
}

const STORAGE_KEY = "pristine-pnp-auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      // Set authentication (after successful login)
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      // Logout and clear all data
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      // Update user profile
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Hydration status
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Selectors for better performance
export const selectUser = (state: AuthState) => state.user;
export const selectToken = (state: AuthState) => state.token;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectUserRole = (state: AuthState) => state.user?.role;
