"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, User } from "@/lib/api";

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      signIn: async (email, password) => {
        try {
          const { user, token } = await api.auth.login({ email, password });
          set({ user, token });
          return { error: null };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : "ログイン失敗" };
        }
      },

      signUp: async (email, password, displayName) => {
        try {
          await api.auth.register({ email, password, display_name: displayName });
          return { error: null };
        } catch (e: unknown) {
          return { error: e instanceof Error ? e.message : "登録失敗" };
        }
      },

      signOut: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: "yugioh-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
