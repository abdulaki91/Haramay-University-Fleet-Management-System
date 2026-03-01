import api from "../axiosInstance";
import type { Vehicle } from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export const vehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await api.get<PaginatedResponse<Vehicle>>("/vehicles");
    return response.data.data;
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.post<ApiResponse<Vehicle>>("/vehicles", data);
    return response.data.data;
  },

  // Alias for create to match frontend usage
  register: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    return vehicleService.create(data);
  },

  update: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.put<ApiResponse<Vehicle>>(
      `/vehicles/${id}`,
      data,
    );
    return response.data.data;
  },

  updateStatus: async (
    id: string,
    status: Vehicle["status"],
  ): Promise<Vehicle> => {
    const response = await api.put<ApiResponse<Vehicle>>(
      `/vehicles/${id}/status`,
      { status },
    );
    return response.data.data;
  },

  search: async (plateNumber: string): Promise<Vehicle[]> => {
    const response = await api.get<ApiResponse<Vehicle[]>>(
      `/vehicles/search/${plateNumber}`,
    );
    return response.data.data;
  },
};
