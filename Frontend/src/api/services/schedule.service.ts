import api from "../axiosInstance";
import type { Schedule } from "@/types";

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

export const scheduleService = {
  getAll: async (): Promise<Schedule[]> => {
    const response = await api.get<PaginatedResponse<Schedule>>("/schedules");
    return response.data.data;
  },

  getById: async (id: string): Promise<Schedule> => {
    const response = await api.get<ApiResponse<Schedule>>(`/schedules/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Schedule>): Promise<Schedule> => {
    const response = await api.post<ApiResponse<Schedule>>("/schedules", data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Schedule>): Promise<Schedule> => {
    const response = await api.put<ApiResponse<Schedule>>(
      `/schedules/${id}`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/schedules/${id}`);
  },
};
