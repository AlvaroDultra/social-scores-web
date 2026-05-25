import { create } from "zustand";
import type { User } from "@/types";

const SESSION_KEY = "ss_token";
const SESSION_USER = "ss_user";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  rehydrate: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,

  setAuth: (token, user) => {
    sessionStorage.setItem(SESSION_KEY, token);
    sessionStorage.setItem(SESSION_USER, JSON.stringify(user));
    set({ token, user });
  },

  updateUser: (partial) => {
    const updated = { ...get().user!, ...partial };
    sessionStorage.setItem(SESSION_USER, JSON.stringify(updated));
    set({ user: updated });
  },

  clearAuth: () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_USER);
    set({ token: null, user: null });
  },

  isAuthenticated: () => get().token !== null,

  rehydrate: () => {
    if (get().token) return;
    try {
      const token = sessionStorage.getItem(SESSION_KEY);
      const raw = sessionStorage.getItem(SESSION_USER);
      if (token && raw) {
        set({ token, user: JSON.parse(raw) });
      }
    } catch {
      // sessionStorage indisponível (SSR) — ignorar
    }
  },
}));
