import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exitService, vehicleService, scheduleService } from "@/api/services";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import type { ExitRequest } from "@/types";
import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function ExitWorkflowPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user)!;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: exitRequests = [], isLoading } = useQuery({
    queryKey: ["exitRequests"],
    queryFn: exitService.getAll,
  });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getAll,
  });
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: scheduleService.getAll,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: "",
    scheduleId: "",
    reason: "",
  });

  // Filter schedules for the current driver and only approved/pending schedules
  const driverSchedules = schedules.filter(
    (s) =>
      String(s.driverId) === String(user.id) &&
      (s.status === "approved" || s.status === "pending"),
  );

  const createMutation = useMutation({
    mutationFn: (data: Partial<ExitRequest>) => exitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exitRequests"] });
      setDialogOpen(false);
      toast({ title: t("exit.exitRequested") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExitRequest> }) =>
      exitService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exitRequests"] });
      toast({
        title:
          variables.data.status === "approved"
            ? t("exit.exitApproved")
            : t("exit.exitRejected"),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, driverId: user.id });
  };

  const getPlate = (id: string) =>
    vehicles.find((v) => v.id === id)?.plateNumber || id;

  const columns = [
    {
      key: "vehicleId",
      label: t("exit.vehicle"),
      render: (e: ExitRequest) => (
        <span className="font-mono font-medium">{getPlate(e.vehicleId)}</span>
      ),
    },
    { key: "reason", label: t("exit.reason") },
    {
      key: "status",
      label: t("exit.status"),
      render: (e: ExitRequest) => <StatusBadge status={e.status} />,
    },
    {
      key: "requestedAt",
      label: t("exit.requested"),
      render: (e: ExitRequest) => new Date(e.requestedAt).toLocaleString(),
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
          <h1 className="page-title">{t("exit.title")}</h1>
          <p className="page-subtitle">{t("exit.subtitle")}</p>
        </div>
        {user.role === "driver" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" /> {t("exit.requestExit")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("exit.requestExit")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("exit.vehicle")}</Label>
                  <Select
                    value={form.vehicleId}
                    onValueChange={(v) => setForm({ ...form, vehicleId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("exit.vehicle")} />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.plateNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("exit.schedule")}</Label>
                  <Select
                    value={form.scheduleId}
                    onValueChange={(v) => setForm({ ...form, scheduleId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          driverSchedules.length === 0
                            ? t("exit.noSchedules")
                            : t("exit.schedule")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {driverSchedules.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          {t("exit.noSchedulesAvailable")}
                        </div>
                      ) : (
                        driverSchedules.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.destination} —{" "}
                            {new Date(s.departureTime).toLocaleDateString()}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {driverSchedules.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("exit.scheduleRequired")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("exit.reason")}</Label>
                  <Textarea
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
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
      <DataTable
        columns={columns}
        data={
          user.role === "security_guard"
            ? exitRequests.filter((e) => e.status === "approved")
            : exitRequests
        }
        searchKeys={["reason"]}
        actions={
          user.role === "vehicle_manager"
            ? (e: ExitRequest) =>
                e.status === "pending" ? (
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-success"
                      onClick={() =>
                        updateMutation.mutate({
                          id: e.id,
                          data: {
                            status: "approved",
                            approvedBy: user.id,
                            approvedAt: new Date().toISOString(),
                          },
                        })
                      }
                    >
                      <Check size={14} className="mr-1" /> {t("exit.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() =>
                        updateMutation.mutate({
                          id: e.id,
                          data: { status: "denied" },
                        })
                      }
                    >
                      <X size={14} className="mr-1" /> {t("exit.deny")}
                    </Button>
                  </div>
                ) : null
            : undefined
        }
      />
    </div>
  );
}
