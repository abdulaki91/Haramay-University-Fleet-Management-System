import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { authService } from "@/api/services";
import { socketService } from "@/services/socket.service";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await authService.login(email, password);
          const { user, token } = response.data;

          set({ user, token, isAuthenticated: true });

          // Connect to socket after successful login
          socketService.connect();
        } catch (error: any) {
          throw new Error(error.response?.data?.error || "Invalid credentials");
        }
      },

      logout: () => {
        socketService.disconnect();
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
        socketService.connect();
      },
    }),
    {
      name: "fleet-auth",
    },
  ),
);
