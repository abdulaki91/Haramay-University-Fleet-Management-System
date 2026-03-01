import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fuelService, vehicleService } from "@/api/services";
import DataTable from "@/components/DataTable";
import type { FuelRecord } from "@/types";
import { Fuel, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function FuelBalancePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user)!;
  const canAddFuel = user.role === "driver" || user.role === "vehicle_manager";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: fuelRecords = [], isLoading } = useQuery({
    queryKey: ["fuel"],
    queryFn: fuelService.getAll,
  });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getAll,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: "",
    liters: 0,
    costPerLiter: 0,
    odometerReading: 0,
    station: "",
    fueledAt: new Date().toISOString().slice(0, 16),
  });

  const addFuelMutation = useMutation({
    mutationFn: (data: any) => fuelService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel"] });
      setDialogOpen(false);
      toast({
        title: t("common.success"),
        description: "Fuel record added successfully",
      });
      setForm({
        vehicleId: "",
        liters: 0,
        costPerLiter: 0,
        odometerReading: 0,
        station: "",
        fueledAt: new Date().toISOString().slice(0, 16),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFuelMutation.mutate(form);
  };

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
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">{t("fuel.title")}</h1>
          <p className="page-subtitle">{t("fuel.subtitle")}</p>
        </div>
        {canAddFuel && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" /> Add Fuel Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Fuel Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("fuel.vehicle")}</Label>
                  <Select
                    value={form.vehicleId}
                    onValueChange={(v) => setForm({ ...form, vehicleId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.plateNumber} — {v.make} {v.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("fuel.liters")}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.liters}
                      onChange={(e) =>
                        setForm({ ...form, liters: Number(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("fuel.costPerLiter")} (ETB)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.costPerLiter}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          costPerLiter: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("fuel.odometer")} (km)</Label>
                  <Input
                    type="number"
                    value={form.odometerReading}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        odometerReading: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("fuel.station")}</Label>
                  <Input
                    value={form.station}
                    onChange={(e) =>
                      setForm({ ...form, station: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("fuel.date")}</Label>
                  <Input
                    type="datetime-local"
                    value={form.fueledAt}
                    onChange={(e) =>
                      setForm({ ...form, fueledAt: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t("common.submit")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
