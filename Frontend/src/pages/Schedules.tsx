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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { useAuthStore } from "@/store/authStore";
import type { Schedule } from "@/types";
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
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
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [form, setForm] = useState({
    vehicleId: "",
    driverId: "",
    destination: "",
    departureTime: undefined as Date | undefined,
    returnTime: undefined as Date | undefined,
    purpose: "",
    passengers: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Schedule>) => scheduleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: t("schedules.scheduleCreated") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Schedule> }) =>
      scheduleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setDialogOpen(false);
      setEditingSchedule(null);
      resetForm();
      toast({ title: t("schedules.scheduleUpdated") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scheduleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast({ title: t("schedules.scheduleDeleted") });
    },
  });

  const resetForm = () => {
    setForm({
      vehicleId: "",
      driverId: "",
      destination: "",
      departureTime: undefined,
      returnTime: undefined,
      purpose: "",
      passengers: 1,
    });
  };

  const openEditDialog = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setForm({
      vehicleId: schedule.vehicleId,
      driverId: schedule.driverId,
      destination: schedule.destination,
      departureTime: new Date(schedule.departureTime),
      returnTime: new Date(schedule.returnTime),
      purpose: schedule.purpose,
      passengers: schedule.passengers,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSchedule(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates
    if (!form.departureTime || !form.returnTime) {
      toast({
        title: "Error",
        description: "Please select both departure and return times",
        variant: "destructive",
      });
      return;
    }

    if (form.returnTime <= form.departureTime) {
      toast({
        title: "Error",
        description: "Return time must be after departure time",
        variant: "destructive",
      });
      return;
    }

    // Convert dates to ISO strings for API
    const scheduleData: Partial<Schedule> = {
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      destination: form.destination,
      purpose: form.purpose,
      passengers: form.passengers,
      departureTime: form.departureTime.toISOString(),
      returnTime: form.returnTime.toISOString(),
      status: editingSchedule ? editingSchedule.status : "scheduled",
    };

    if (editingSchedule) {
      updateMutation.mutate({ id: editingSchedule.id, data: scheduleData });
    } else {
      createMutation.mutate(scheduleData);
    }
  };

  const handleDelete = (scheduleId: string) => {
    deleteMutation.mutate(scheduleId);
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
    ...(canCreate
      ? [
          {
            key: "actions",
            label: t("common.actions"),
            render: (s: Schedule) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(s)}
                  disabled={
                    s.status === "completed" || s.status === "cancelled"
                  }
                >
                  <Edit size={16} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        s.status === "in_progress" || s.status === "completed"
                      }
                    >
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("schedules.deleteConfirmTitle")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("schedules.deleteConfirmMessage")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t("common.cancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(s.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t("common.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ),
          },
        ]
      : []),
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
              <Button onClick={openCreateDialog}>
                <Plus size={16} className="mr-2" />{" "}
                {t("schedules.createSchedule")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSchedule
                    ? t("schedules.editSchedule")
                    : t("schedules.createSchedule")}
                </DialogTitle>
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
                    <DateTimePicker
                      date={form.departureTime}
                      setDate={(date) =>
                        setForm({ ...form, departureTime: date })
                      }
                      placeholder="Select departure date & time"
                      minDate={new Date()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("schedules.return")}</Label>
                    <DateTimePicker
                      date={form.returnTime}
                      setDate={(date) => setForm({ ...form, returnTime: date })}
                      placeholder="Select return date & time"
                      minDate={form.departureTime || new Date()}
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
                  {editingSchedule
                    ? t("schedules.updateSchedule")
                    : t("schedules.createSchedule")}
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
