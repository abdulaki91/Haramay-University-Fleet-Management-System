import api from "../axiosInstance";
import type { FuelRecord } from "@/types";

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

export const fuelService = {
  getAll: async (): Promise<FuelRecord[]> => {
    const response = await api.get<PaginatedResponse<FuelRecord>>("/fuel");
    return response.data.data;
  },

  getByVehicle: async (vehicleId: string): Promise<FuelRecord[]> => {
    const response = await api.get<PaginatedResponse<FuelRecord>>(
      `/fuel/vehicle/${vehicleId}`,
    );
    return response.data.data;
  },

  create: async (data: Partial<FuelRecord>): Promise<FuelRecord> => {
    const response = await api.post<ApiResponse<FuelRecord>>("/fuel", data);
    return response.data.data;
  },

  getConsumption: async (vehicleId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(
      `/fuel/vehicle/${vehicleId}/consumption`,
    );
    return response.data.data;
  },

  getBalance: async (vehicleId: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(
      `/fuel/vehicle/${vehicleId}/balance`,
    );
    return response.data.data;
  },
};
