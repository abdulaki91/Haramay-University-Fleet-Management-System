import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleService, vehicleService, userService } from "@/api/services";
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
import { useAuthStore } from "@/store/authStore";
import type { Schedule } from "@/types";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function SchedulesPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user)!;
  const canCreate = user.role === "scheduler";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: scheduleService.getAll,
  });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getAll,
  });
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAll,
    enabled: canCreate, // Only fetch users if user is a scheduler
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: "",
    driverId: "",
    destination: "",
    departureTime: "",
    returnTime: "",
    purpose: "",
    passengers: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Schedule>) => scheduleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setDialogOpen(false);
      toast({ title: t("schedules.scheduleCreated") });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, status: "pending" });
  };

  // Filter users to show only drivers
  const drivers = users.filter((u) => u.role === "driver");

  const columns = [
    {
      key: "destination",
      label: t("schedules.destination"),
      render: (s: Schedule) => (
        <span className="font-medium">{s.destination}</span>
      ),
    },
    { key: "purpose", label: t("schedules.purpose") },
    {
      key: "departureTime",
      label: t("schedules.departure"),
      render: (s: Schedule) => new Date(s.departureTime).toLocaleString(),
    },
    {
      key: "returnTime",
      label: t("schedules.return"),
      render: (s: Schedule) => new Date(s.returnTime).toLocaleString(),
    },
    { key: "passengers", label: t("schedules.passengers") },
    {
      key: "status",
      label: t("schedules.status"),
      render: (s: Schedule) => <StatusBadge status={s.status} />,
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
          <h1 className="page-title">{t("schedules.title")}</h1>
          <p className="page-subtitle">{t("schedules.subtitle")}</p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />{" "}
                {t("schedules.createSchedule")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("schedules.createSchedule")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("schedules.vehicle")}</Label>
                  <Select
                    value={form.vehicleId}
                    onValueChange={(v) => setForm({ ...form, vehicleId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("schedules.vehicle")} />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles
                        .filter((v) => v.status === "available")
                        .map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.plateNumber} — {v.make} {v.model}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("schedules.driver")}</Label>
                  <Select
                    value={form.driverId}
                    onValueChange={(v) => setForm({ ...form, driverId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("schedules.selectDriver")} />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          {t("schedules.noDrivers")}
                        </div>
                      ) : (
                        drivers.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.fullName} ({d.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("schedules.destination")}</Label>
                  <Input
                    value={form.destination}
                    onChange={(e) =>
                      setForm({ ...form, destination: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("schedules.purpose")}</Label>
                  <Input
                    value={form.purpose}
                    onChange={(e) =>
                      setForm({ ...form, purpose: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("schedules.departure")}</Label>
                    <Input
                      type="datetime-local"
                      value={form.departureTime}
                      onChange={(e) =>
                        setForm({ ...form, departureTime: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("schedules.return")}</Label>
                    <Input
                      type="datetime-local"
                      value={form.returnTime}
                      onChange={(e) =>
                        setForm({ ...form, returnTime: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("schedules.passengers")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.passengers}
                    onChange={(e) =>
                      setForm({ ...form, passengers: Number(e.target.value) })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t("schedules.createSchedule")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <DataTable
        columns={columns}
        data={schedules}
        searchKeys={["destination", "purpose"]}
      />
    </div>
  );
}
