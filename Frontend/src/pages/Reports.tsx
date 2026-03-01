import { useQuery } from "@tanstack/react-query";
import {
  vehicleService,
  scheduleService,
  fuelService,
  maintenanceService,
  exitService,
} from "@/api/services";
import {
  Car,
  CalendarDays,
  Fuel,
  Wrench,
  Shield,
  FileBarChart,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ReportsPage() {
  const { t } = useTranslation();
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getAll,
  });
  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules"],
    queryFn: scheduleService.getAll,
  });
  const { data: fuelRecords = [] } = useQuery({
    queryKey: ["fuel"],
    queryFn: fuelService.getAll,
  });
  const { data: maintenance = [] } = useQuery({
    queryKey: ["maintenance"],
    queryFn: maintenanceService.getAll,
  });
  const { data: exitRequests = [] } = useQuery({
    queryKey: ["exitRequests"],
    queryFn: exitService.getAll,
  });

  const totalFuelCost = fuelRecords.reduce((s, f) => s + f.totalCost, 0);
  const totalMaintenanceCost = maintenance.reduce(
    (s, m) => s + (m.estimatedCost || 0),
    0,
  );

  const reportCards = [
    {
      title: t("reports.fleetOverview"),
      icon: <Car size={24} />,
      stats: [
        { label: t("reports.totalVehicles"), value: vehicles.length },
        {
          label: t("reports.available"),
          value: vehicles.filter((v) => v.status === "available").length,
        },
        {
          label: t("reports.inUse"),
          value: vehicles.filter((v) => v.status === "in_use").length,
        },
        {
          label: t("reports.underMaintenance"),
          value: vehicles.filter((v) => v.status === "maintenance").length,
        },
      ],
    },
    {
      title: t("reports.scheduleSummary"),
      icon: <CalendarDays size={24} />,
      stats: [
        { label: t("reports.totalSchedules"), value: schedules.length },
        {
          label: t("schedules.approved"),
          value: schedules.filter((s) => s.status === "approved").length,
        },
        {
          label: t("schedules.pending"),
          value: schedules.filter((s) => s.status === "pending").length,
        },
        {
          label: t("schedules.completed"),
          value: schedules.filter((s) => s.status === "completed").length,
        },
      ],
    },
    {
      title: t("reports.fuelReport"),
      icon: <Fuel size={24} />,
      stats: [
        { label: t("reports.totalRecords"), value: fuelRecords.length },
        {
          label: t("fuel.totalLiters"),
          value: `${fuelRecords.reduce((s, f) => s + f.liters, 0)} L`,
        },
        {
          label: t("fuel.totalCost"),
          value: `${totalFuelCost.toLocaleString()} ETB`,
        },
        {
          label: t("reports.avgCostPerRecord"),
          value: fuelRecords.length
            ? `${Math.round(totalFuelCost / fuelRecords.length).toLocaleString()} ETB`
            : "—",
        },
      ],
    },
    {
      title: t("reports.maintenanceReport"),
      icon: <Wrench size={24} />,
      stats: [
        { label: t("reports.totalRequests"), value: maintenance.length },
        {
          label: t("maintenance.pending"),
          value: maintenance.filter((m) => m.status === "pending").length,
        },
        {
          label: t("maintenance.inProgress"),
          value: maintenance.filter((m) => m.status === "in_progress").length,
        },
        {
          label: t("maintenance.estimatedCost"),
          value: `${totalMaintenanceCost.toLocaleString()} ETB`,
        },
      ],
    },
    {
      title: t("reports.exitRequests"),
      icon: <Shield size={24} />,
      stats: [
        { label: t("reports.totalRequests"), value: exitRequests.length },
        {
          label: t("exit.approved"),
          value: exitRequests.filter((e) => e.status === "approved").length,
        },
        {
          label: t("exit.pending"),
          value: exitRequests.filter((e) => e.status === "pending").length,
        },
        {
          label: t("exit.denied"),
          value: exitRequests.filter((e) => e.status === "denied").length,
        },
      ],
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1">
          <FileBarChart size={28} className="text-accent" />
          <h1 className="page-title">{t("reports.title")}</h1>
        </div>
        <p className="page-subtitle">{t("reports.subtitle")}</p>
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
