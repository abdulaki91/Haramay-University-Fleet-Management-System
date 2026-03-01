import api from "../axiosInstance";
import type { ExitRequest } from "@/types";

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

export const exitService = {
  getAll: async (): Promise<ExitRequest[]> => {
    const response =
      await api.get<PaginatedResponse<ExitRequest>>("/exit-requests");
    return response.data.data;
  },

  getApproved: async (): Promise<ExitRequest[]> => {
    const response = await api.get<PaginatedResponse<ExitRequest>>(
      "/exit-requests/approved",
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<ExitRequest> => {
    const response = await api.get<ApiResponse<ExitRequest>>(
      `/exit-requests/${id}`,
    );
    return response.data.data;
  },

  create: async (data: Partial<ExitRequest>): Promise<ExitRequest> => {
    const response = await api.post<ApiResponse<ExitRequest>>(
      "/exit-requests",
      data,
    );
    return response.data.data;
  },

  approve: async (id: string): Promise<ExitRequest> => {
    const response = await api.put<ApiResponse<ExitRequest>>(
      `/exit-requests/${id}/approve`,
    );
    return response.data.data;
  },

  reject: async (id: string, reason: string): Promise<ExitRequest> => {
    const response = await api.put<ApiResponse<ExitRequest>>(
      `/exit-requests/${id}/reject`,
      {
        rejection_reason: reason,
      },
    );
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<ExitRequest>,
  ): Promise<ExitRequest> => {
    // For compatibility with existing code
    if (data.status === "approved") {
      return exitService.approve(id);
    } else if (data.status === "denied") {
      return exitService.reject(id, "Denied by manager");
    }
    throw new Error("Invalid status update");
  },
};
