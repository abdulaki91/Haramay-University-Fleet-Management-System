import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  vehicleService,
  scheduleService,
  exitService,
  maintenanceService,
  fuelService,
} from "@/api/services";
import { ROLE_LABELS } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import {
  Car,
  CalendarDays,
  Fuel,
  Wrench,
  Shield,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user)!;

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getAll,
  });
  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules"],
    queryFn: scheduleService.getAll,
  });
  const { data: exitRequests = [] } = useQuery({
    queryKey: ["exitRequests"],
    queryFn: exitService.getAll,
  });
  const { data: maintenance = [] } = useQuery({
    queryKey: ["maintenance"],
    queryFn: maintenanceService.getAll,
  });
  const { data: fuelRecords = [] } = useQuery({
    queryKey: ["fuel"],
    queryFn: fuelService.getAll,
  });

  const stats = [
    {
      label: t("dashboard.totalVehicles"),
      value: vehicles.length,
      icon: <Car size={22} />,
      color: "text-info",
    },
    {
      label: t("dashboard.scheduledTrips"),
      value: schedules.length,
      icon: <CalendarDays size={22} />,
      color: "text-success",
    },
    {
      label: t("dashboard.exitRequests"),
      value: exitRequests.filter((e) => e.status === "pending").length,
      icon: <Shield size={22} />,
      color: "text-warning",
    },
    {
      label: t("dashboard.maintenance"),
      value: maintenance.filter((m) => m.status !== "completed").length,
      icon: <Wrench size={22} />,
      color: "text-destructive",
    },
  ];

  const totalFuel = fuelRecords.reduce((sum, f) => sum + f.totalCost, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t("dashboard.title")}</h1>
        <p className="page-subtitle">
          {t("dashboard.welcomeBack")}, {user.fullName} —{" "}
          {t(`roles.${user.role}`)}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className={`${stat.color}`}>{stat.icon}</span>
              <TrendingUp size={14} className="text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Fuel summary for vehicle manager */}
      {(user.role === "vehicle_manager" || user.role === "system_admin") && (
        <div className="stat-card mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Fuel size={20} className="text-warning" />
            <h3 className="font-semibold">{t("dashboard.fuelExpenditure")}</h3>
          </div>
          <p className="text-3xl font-bold">{totalFuel.toLocaleString()} ETB</p>
          <p className="text-sm text-muted-foreground">
            {fuelRecords.length} {t("dashboard.fuelRecordsTotal")}
          </p>
        </div>
      )}

      {/* Recent schedules */}
      <div className="table-container">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold">{t("dashboard.recentSchedules")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                  {t("schedules.destination")}
                </th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                  {t("schedules.purpose")}
                </th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                  {t("schedules.departure")}
                </th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                  {t("schedules.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {schedules.slice(0, 5).map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{s.destination}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {s.purpose}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(s.departureTime).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
