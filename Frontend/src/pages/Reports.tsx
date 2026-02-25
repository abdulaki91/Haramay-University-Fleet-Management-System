import { useQuery } from "@tanstack/react-query";
import { vehicleService, scheduleService, fuelService, maintenanceService, exitService } from "@/api/services";
import { Car, CalendarDays, Fuel, Wrench, Shield, FileBarChart } from "lucide-react";

export default function ReportsPage() {
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: vehicleService.getAll });
  const { data: schedules = [] } = useQuery({ queryKey: ["schedules"], queryFn: scheduleService.getAll });
  const { data: fuelRecords = [] } = useQuery({ queryKey: ["fuel"], queryFn: fuelService.getAll });
  const { data: maintenance = [] } = useQuery({ queryKey: ["maintenance"], queryFn: maintenanceService.getAll });
  const { data: exitRequests = [] } = useQuery({ queryKey: ["exitRequests"], queryFn: exitService.getAll });

  const totalFuelCost = fuelRecords.reduce((s, f) => s + f.totalCost, 0);
  const totalMaintenanceCost = maintenance.reduce((s, m) => s + (m.estimatedCost || 0), 0);

  const reportCards = [
    { title: "Fleet Overview", icon: <Car size={24} />, stats: [
      { label: "Total Vehicles", value: vehicles.length },
      { label: "Available", value: vehicles.filter((v) => v.status === "available").length },
      { label: "In Use", value: vehicles.filter((v) => v.status === "in_use").length },
      { label: "Under Maintenance", value: vehicles.filter((v) => v.status === "maintenance").length },
    ]},
    { title: "Schedule Summary", icon: <CalendarDays size={24} />, stats: [
      { label: "Total Schedules", value: schedules.length },
      { label: "Approved", value: schedules.filter((s) => s.status === "approved").length },
      { label: "Pending", value: schedules.filter((s) => s.status === "pending").length },
      { label: "Completed", value: schedules.filter((s) => s.status === "completed").length },
    ]},
    { title: "Fuel Report", icon: <Fuel size={24} />, stats: [
      { label: "Total Records", value: fuelRecords.length },
      { label: "Total Liters", value: `${fuelRecords.reduce((s, f) => s + f.liters, 0)} L` },
      { label: "Total Cost", value: `${totalFuelCost.toLocaleString()} ETB` },
      { label: "Avg Cost/Record", value: fuelRecords.length ? `${Math.round(totalFuelCost / fuelRecords.length).toLocaleString()} ETB` : "—" },
    ]},
    { title: "Maintenance Report", icon: <Wrench size={24} />, stats: [
      { label: "Total Requests", value: maintenance.length },
      { label: "Pending", value: maintenance.filter((m) => m.status === "pending").length },
      { label: "In Progress", value: maintenance.filter((m) => m.status === "in_progress").length },
      { label: "Est. Total Cost", value: `${totalMaintenanceCost.toLocaleString()} ETB` },
    ]},
    { title: "Exit Requests", icon: <Shield size={24} />, stats: [
      { label: "Total Requests", value: exitRequests.length },
      { label: "Approved", value: exitRequests.filter((e) => e.status === "approved").length },
      { label: "Pending", value: exitRequests.filter((e) => e.status === "pending").length },
      { label: "Denied", value: exitRequests.filter((e) => e.status === "denied").length },
    ]},
  ];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1">
          <FileBarChart size={28} className="text-accent" />
          <h1 className="page-title">Reports</h1>
        </div>
        <p className="page-subtitle">Overview of fleet operations and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((card) => (
          <div key={card.title} className="stat-card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-accent">{card.icon}</span>
              <h3 className="font-semibold text-lg">{card.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {card.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
