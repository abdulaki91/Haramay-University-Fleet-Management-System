// Service placeholders — swap mock for real API calls when backend is ready
import { mockApi } from "@/api/mock/mockApi";
import api from "@/api/axiosInstance";
import type { User, Vehicle, Schedule, FuelRecord, ExitRequest, MaintenanceRequest } from "@/types";

const useMock = import.meta.env.VITE_USE_MOCK_API !== "false";

export const userService = {
  getAll: (): Promise<User[]> => useMock ? mockApi.getUsers() : api.get("/users").then((r) => r.data),
  create: (data: Partial<User>): Promise<User> => useMock ? mockApi.createUser(data) : api.post("/users", data).then((r) => r.data),
  update: (id: string, data: Partial<User>): Promise<User> => useMock ? mockApi.updateUser(id, data) : api.put(`/users/${id}`, data).then((r) => r.data),
  delete: (id: string): Promise<void> => useMock ? mockApi.deleteUser(id) : api.delete(`/users/${id}`).then(() => {}),
};

export const vehicleService = {
  getAll: (): Promise<Vehicle[]> => useMock ? mockApi.getVehicles() : api.get("/vehicles").then((r) => r.data),
  register: (data: Partial<Vehicle>): Promise<Vehicle> => useMock ? mockApi.registerVehicle(data) : api.post("/vehicles", data).then((r) => r.data),
  update: (id: string, data: Partial<Vehicle>): Promise<Vehicle> => useMock ? mockApi.updateVehicle(id, data) : api.put(`/vehicles/${id}`, data).then((r) => r.data),
};

export const scheduleService = {
  getAll: (): Promise<Schedule[]> => useMock ? mockApi.getSchedules() : api.get("/schedules").then((r) => r.data),
  create: (data: Partial<Schedule>): Promise<Schedule> => useMock ? mockApi.createSchedule(data) : api.post("/schedules", data).then((r) => r.data),
};

export const fuelService = {
  getAll: (): Promise<FuelRecord[]> => useMock ? mockApi.getFuelRecords() : api.get("/fuel").then((r) => r.data),
  add: (data: Partial<FuelRecord>): Promise<FuelRecord> => useMock ? mockApi.addFuelRecord(data) : api.post("/fuel", data).then((r) => r.data),
};

export const exitService = {
  getAll: (): Promise<ExitRequest[]> => useMock ? mockApi.getExitRequests() : api.get("/exit-requests").then((r) => r.data),
  create: (data: Partial<ExitRequest>): Promise<ExitRequest> => useMock ? mockApi.createExitRequest(data) : api.post("/exit-requests", data).then((r) => r.data),
  update: (id: string, data: Partial<ExitRequest>): Promise<ExitRequest> => useMock ? mockApi.updateExitRequest(id, data) : api.put(`/exit-requests/${id}`, data).then((r) => r.data),
};

export const maintenanceService = {
  getAll: (): Promise<MaintenanceRequest[]> => useMock ? mockApi.getMaintenanceRequests() : api.get("/maintenance").then((r) => r.data),
  create: (data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> => useMock ? mockApi.createMaintenanceRequest(data) : api.post("/maintenance", data).then((r) => r.data),
};
