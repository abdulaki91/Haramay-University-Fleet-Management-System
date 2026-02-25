import { mockVehicles, mockSchedules, mockFuelRecords, mockExitRequests, mockMaintenanceRequests, mockUsers } from "./mockData";
import type { Vehicle, Schedule, FuelRecord, ExitRequest, MaintenanceRequest, User } from "@/types";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  // Users
  getUsers: async (): Promise<User[]> => { await delay(); return [...mockUsers]; },
  createUser: async (user: Partial<User>): Promise<User> => {
    await delay();
    const newUser: User = { ...user, id: `u${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as User;
    mockUsers.push(newUser);
    return newUser;
  },
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    await delay();
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("User not found");
    mockUsers[idx] = { ...mockUsers[idx], ...data, updatedAt: new Date().toISOString() };
    return mockUsers[idx];
  },
  deleteUser: async (id: string): Promise<void> => {
    await delay();
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx !== -1) mockUsers.splice(idx, 1);
  },

  // Vehicles
  getVehicles: async (): Promise<Vehicle[]> => { await delay(); return [...mockVehicles]; },
  registerVehicle: async (v: Partial<Vehicle>): Promise<Vehicle> => {
    await delay();
    const nv: Vehicle = { ...v, id: `v${Date.now()}`, registeredAt: new Date().toISOString() } as Vehicle;
    mockVehicles.push(nv);
    return nv;
  },
  updateVehicle: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    await delay();
    const idx = mockVehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error("Vehicle not found");
    mockVehicles[idx] = { ...mockVehicles[idx], ...data };
    return mockVehicles[idx];
  },

  // Schedules
  getSchedules: async (): Promise<Schedule[]> => { await delay(); return [...mockSchedules]; },
  createSchedule: async (s: Partial<Schedule>): Promise<Schedule> => {
    await delay();
    const ns: Schedule = { ...s, id: `s${Date.now()}`, createdAt: new Date().toISOString() } as Schedule;
    mockSchedules.push(ns);
    return ns;
  },

  // Fuel
  getFuelRecords: async (): Promise<FuelRecord[]> => { await delay(); return [...mockFuelRecords]; },
  addFuelRecord: async (f: Partial<FuelRecord>): Promise<FuelRecord> => {
    await delay();
    const nf: FuelRecord = { ...f, id: `f${Date.now()}` } as FuelRecord;
    mockFuelRecords.push(nf);
    return nf;
  },

  // Exit Requests
  getExitRequests: async (): Promise<ExitRequest[]> => { await delay(); return [...mockExitRequests]; },
  createExitRequest: async (e: Partial<ExitRequest>): Promise<ExitRequest> => {
    await delay();
    const ne: ExitRequest = { ...e, id: `e${Date.now()}`, requestedAt: new Date().toISOString(), status: "pending" } as ExitRequest;
    mockExitRequests.push(ne);
    return ne;
  },
  updateExitRequest: async (id: string, data: Partial<ExitRequest>): Promise<ExitRequest> => {
    await delay();
    const idx = mockExitRequests.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Exit request not found");
    mockExitRequests[idx] = { ...mockExitRequests[idx], ...data };
    return mockExitRequests[idx];
  },

  // Maintenance
  getMaintenanceRequests: async (): Promise<MaintenanceRequest[]> => { await delay(); return [...mockMaintenanceRequests]; },
  createMaintenanceRequest: async (m: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> => {
    await delay();
    const nm: MaintenanceRequest = { ...m, id: `m${Date.now()}`, requestedAt: new Date().toISOString(), status: "pending" } as MaintenanceRequest;
    mockMaintenanceRequests.push(nm);
    return nm;
  },
};
