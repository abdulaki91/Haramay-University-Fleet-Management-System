import { useQuery } from "@tanstack/react-query";
import { fuelService, vehicleService } from "@/api/services";
import DataTable from "@/components/DataTable";
import type { FuelRecord } from "@/types";
import { Fuel } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FuelBalancePage() {
  const { t } = useTranslation();
  const { data: fuelRecords = [], isLoading } = useQuery({
    queryKey: ["fuel"],
    queryFn: fuelService.getAll,
  });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getAll,
  });

  const getPlate = (id: string) =>
    vehicles.find((v) => v.id === id)?.plateNumber || id;
  const totalCost = fuelRecords.reduce((s, f) => s + f.totalCost, 0);
  const totalLiters = fuelRecords.reduce((s, f) => s + f.liters, 0);

  const columns = [
    {
      key: "vehicleId",
      label: t("fuel.vehicle"),
      render: (f: FuelRecord) => (
        <span className="font-mono font-medium">{getPlate(f.vehicleId)}</span>
      ),
    },
    {
      key: "liters",
      label: t("fuel.liters"),
      render: (f: FuelRecord) => `${f.liters} L`,
    },
    {
      key: "costPerLiter",
      label: t("fuel.costPerLiter"),
      render: (f: FuelRecord) => `${f.costPerLiter} ETB`,
    },
    {
      key: "totalCost",
      label: t("fuel.totalCost"),
      render: (f: FuelRecord) => (
        <span className="font-semibold">
          {f.totalCost.toLocaleString()} ETB
        </span>
      ),
    },
    {
      key: "odometerReading",
      label: t("fuel.odometer"),
      render: (f: FuelRecord) => `${f.odometerReading.toLocaleString()} km`,
    },
    { key: "station", label: t("fuel.station") },
    {
      key: "fueledAt",
      label: t("fuel.date"),
      render: (f: FuelRecord) => new Date(f.fueledAt).toLocaleDateString(),
    },
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {t("common.loading")}
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t("fuel.title")}</h1>
        <p className="page-subtitle">{t("fuel.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Fuel size={18} className="text-warning" />
            <span className="text-sm text-muted-foreground">
              {t("fuel.totalCost")}
            </span>
          </div>
          <p className="text-2xl font-bold">{totalCost.toLocaleString()} ETB</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Fuel size={18} className="text-info" />
            <span className="text-sm text-muted-foreground">
              {t("fuel.totalLiters")}
            </span>
          </div>
          <p className="text-2xl font-bold">{totalLiters.toLocaleString()} L</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Fuel size={18} className="text-success" />
            <span className="text-sm text-muted-foreground">
              {t("fuel.records")}
            </span>
          </div>
          <p className="text-2xl font-bold">{fuelRecords.length}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={fuelRecords}
        searchKeys={["station"]}
      />
    </div>
  );
}
