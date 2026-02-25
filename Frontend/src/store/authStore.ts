import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role } from "@/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

// Mock users for demo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: "admin123",
    user: {
      id: "1",
      username: "admin",
      email: "admin@haramaya.edu.et",
      fullName: "Admin User",
      role: "system_admin",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  },
  guard: {
    password: "guard123",
    user: {
      id: "2",
      username: "guard",
      email: "guard@haramaya.edu.et",
      fullName: "Security Officer",
      role: "security_guard",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  },
  driver: {
    password: "driver123",
    user: {
      id: "3",
      username: "driver",
      email: "driver@haramaya.edu.et",
      fullName: "Abebe Kebede",
      role: "driver",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  },
  mechanic: {
    password: "mech123",
    user: {
      id: "4",
      username: "mechanic",
      email: "mechanic@haramaya.edu.et",
      fullName: "Tekle Haile",
      role: "mechanic",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  },
  scheduler: {
    password: "sched123",
    user: {
      id: "5",
      username: "scheduler",
      email: "scheduler@haramaya.edu.et",
      fullName: "Meron Tadesse",
      role: "scheduler",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  },
  vmanager: {
    password: "vm123",
    user: {
      id: "6",
      username: "vmanager",
      email: "vmanager@haramaya.edu.et",
      fullName: "Dawit Mengistu",
      role: "vehicle_manager",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  },
  user: {
    password: "user123",
    user: {
      id: "7",
      username: "user",
      email: "user@haramaya.edu.et",
      fullName: "Student User",
      role: "user",
      isActive: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        // Simulate API delay
        await new Promise((r) => setTimeout(r, 800));

        const entry = MOCK_USERS[username];
        if (!entry || entry.password !== password) {
          throw new Error("Invalid username or password");
        }

        const token = `mock-jwt-${entry.user.role}-${Date.now()}`;
        set({ user: entry.user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
      },
    }),
    {
      name: "fleet-auth",
    }
  )
);

export const MOCK_CREDENTIALS = Object.entries(MOCK_USERS).map(([username, { password, user }]) => ({
  username,
  password,
  role: user.role,
  fullName: user.fullName,
}));
