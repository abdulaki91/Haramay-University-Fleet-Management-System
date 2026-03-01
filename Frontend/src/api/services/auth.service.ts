import api from "../axiosInstance";
import type { User } from "@/types";

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<ProfileResponse>("/auth/profile");
    return response.data.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await api.put("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};
