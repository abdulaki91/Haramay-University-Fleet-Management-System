import api from "../axiosInstance";
import type { User } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<PaginatedResponse<User>>("/users");
    return response.data.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<User>): Promise<User> => {
    const response = await api.post<ApiResponse<User>>("/users", data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  assignRole: async (id: string, roleId: number): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/role`, {
      role_id: roleId,
    });
    return response.data.data;
  },
};
