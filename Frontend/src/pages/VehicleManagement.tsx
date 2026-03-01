import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "@/api/services";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
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
import type { Vehicle } from "@/types";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function VehicleManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getAll,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({
    plateNumber: "",
    model: "",
    make: "",
    year: 2024,
    type: "sedan" as Vehicle["type"],
    fuelType: "diesel" as Vehicle["fuelType"],
    mileage: 0,
    status: "available" as Vehicle["status"],
  });

  const registerMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => vehicleService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setDialogOpen(false);
      toast({ title: t("vehicles.vehicleRegistered") });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      plateNumber: "",
      model: "",
      make: "",
      year: 2024,
      type: "sedan",
      fuelType: "diesel",
      mileage: 0,
      status: "available",
    });
    setDialogOpen(true);
  };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      plateNumber: v.plateNumber,
      model: v.model,
      make: v.make,
      year: v.year,
      type: v.type,
      fuelType: v.fuelType,
      mileage: v.mileage,
      status: v.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      vehicleService.update(editing.id, form).then(() => {
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        setDialogOpen(false);
        toast({ title: t("vehicles.vehicleUpdated") });
      });
    } else {
      registerMutation.mutate(form);
    }
  };

  const columns = [
    {
      key: "plateNumber",
      label: t("vehicles.plateNumber"),
      render: (v: Vehicle) => (
        <span className="font-mono font-medium">{v.plateNumber}</span>
      ),
    },
    { key: "make", label: t("vehicles.make") },
    { key: "model", label: t("vehicles.model") },
    { key: "year", label: t("vehicles.year") },
    {
      key: "type",
      label: t("vehicles.type"),
      render: (v: Vehicle) => <span className="capitalize">{v.type}</span>,
    },
    {
      key: "status",
      label: t("vehicles.status"),
      render: (v: Vehicle) => <StatusBadge status={v.status} />,
    },
    {
      key: "mileage",
      label: t("vehicles.mileage"),
      render: (v: Vehicle) => <span>{v.mileage.toLocaleString()} km</span>,
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
          <h1 className="page-title">{t("vehicles.title")}</h1>
          <p className="page-subtitle">{t("vehicles.subtitle")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus size={16} className="mr-2" />{" "}
              {t("vehicles.registerVehicle")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? t("vehicles.editVehicle")
                  : t("vehicles.registerVehicle")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("vehicles.plateNumber")}</Label>
                  <Input
                    value={form.plateNumber}
                    onChange={(e) =>
                      setForm({ ...form, plateNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("vehicles.make")}</Label>
                  <Input
                    value={form.make}
                    onChange={(e) => setForm({ ...form, make: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("vehicles.model")}</Label>
                  <Input
                    value={form.model}
                    onChange={(e) =>
                      setForm({ ...form, model: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("vehicles.year")}</Label>
                  <Input
                    type="number"
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("vehicles.type")}</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm({ ...form, type: v as Vehicle["type"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["bus", "van", "pickup", "sedan", "truck"].map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("vehicles.fuelType")}</Label>
                  <Select
                    value={form.fuelType}
                    onValueChange={(v) =>
                      setForm({ ...form, fuelType: v as Vehicle["fuelType"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["diesel", "petrol", "electric", "hybrid"].map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("vehicles.mileage")} (km)</Label>
                  <Input
                    type="number"
                    value={form.mileage}
                    onChange={(e) =>
                      setForm({ ...form, mileage: Number(e.target.value) })
                    }
                  />
                </div>
                {editing && (
                  <div className="space-y-2">
                    <Label>{t("vehicles.status")}</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) =>
                        setForm({ ...form, status: v as Vehicle["status"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["available", "in_use", "maintenance", "retired"].map(
                          (s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="capitalize"
                            >
                              {s.replace("_", " ")}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">
                {editing ? t("common.update") : t("vehicles.registerVehicle")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={vehicles}
        searchKeys={["plateNumber", "make", "model"]}
        actions={(v: Vehicle) => (
          <Button variant="outline" size="sm" onClick={() => openEdit(v)}>
            <Pencil size={14} />
          </Button>
        )}
      />
    </div>
  );
}
