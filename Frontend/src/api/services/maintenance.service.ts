import api from "../axiosInstance";
import type { MaintenanceRequest } from "@/types";

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

export const maintenanceService = {
  getAll: async (): Promise<MaintenanceRequest[]> => {
    const response =
      await api.get<PaginatedResponse<MaintenanceRequest>>("/maintenance");
    return response.data.data;
  },

  getById: async (id: string): Promise<MaintenanceRequest> => {
    const response = await api.get<ApiResponse<MaintenanceRequest>>(
      `/maintenance/${id}`,
    );
    return response.data.data;
  },

  create: async (
    data: Partial<MaintenanceRequest>,
  ): Promise<MaintenanceRequest> => {
    const response = await api.post<ApiResponse<MaintenanceRequest>>(
      "/maintenance",
      data,
    );
    return response.data.data;
  },

  updateStatus: async (
    id: string,
    data: Partial<MaintenanceRequest>,
  ): Promise<MaintenanceRequest> => {
    const response = await api.put<ApiResponse<MaintenanceRequest>>(
      `/maintenance/${id}/status`,
      data,
    );
    return response.data.data;
  },
};
