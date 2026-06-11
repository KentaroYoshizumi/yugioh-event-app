import { create } from 'zustand';
import { localAuth } from '../lib/localAuth';

type User = {
  id: string;
  email: string;
  user_metadata: { display_name: string };
};

type Session = {
  user: User;
};

type AuthStore = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  loading: true,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  signIn: async (email, password) => {
    const { session, error } = await localAuth.signIn(email, password);
    if (session) set({ session, user: session.user });
    return { error };
  },

  signUp: async (email, password, displayName) => {
    return localAuth.signUp(email, password, displayName);
  },

  signOut: async () => {
    await localAuth.signOut();
    set({ session: null, user: null });
  },

  initialize: async () => {
    const session = await localAuth.getSession();
    set({ session, user: session?.user ?? null, loading: false });
  },
}));
