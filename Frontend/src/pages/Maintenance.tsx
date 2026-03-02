import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceService, vehicleService } from "@/api/services";
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
import type { MaintenanceRequest } from "@/types";
import { useState } from "react";
import { Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function MaintenancePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user)!;
  const canCreate = user.role === "driver";
  const canUpdate = user.role === "mechanic" || user.role === "vehicle_manager";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: maintenanceService.getAll,
  });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getAll,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);
  const [form, setForm] = useState({
    vehicleId: "",
    type: "routine" as MaintenanceRequest["type"],
    description: "",
    priority: "medium" as MaintenanceRequest["priority"],
    estimatedCost: 0,
  });
  const [updateForm, setUpdateForm] = useState({
    status: "pending" as MaintenanceRequest["status"],
    notes: "",
    estimatedCost: 0,
    actualCost: 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<MaintenanceRequest>) =>
      maintenanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      setDialogOpen(false);
      toast({ title: t("maintenance.maintenanceRequested") });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      maintenanceService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      setUpdateDialogOpen(false);
      toast({ title: "Maintenance request updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to update maintenance request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, requestedBy: user.id });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    updateMutation.mutate({
      id: selectedRequest.id,
      data: updateForm,
    });
  };

  const openUpdateDialog = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setUpdateForm({
      status: request.status,
      notes: request.notes || "",
      estimatedCost: request.estimatedCost || 0,
      actualCost: request.actualCost || 0,
    });
    setUpdateDialogOpen(true);
  };

  const getPlate = (id: string) =>
    vehicles.find((v) => v.id === id)?.plateNumber || id;

  const columns = [
    {
      key: "vehicleId",
      label: t("maintenance.vehicle"),
      render: (m: MaintenanceRequest) => (
        <span className="font-mono font-medium">{getPlate(m.vehicleId)}</span>
      ),
    },
    {
      key: "type",
      label: t("maintenance.type"),
      render: (m: MaintenanceRequest) => <StatusBadge status={m.type} />,
    },
    { key: "description", label: t("maintenance.description") },
    {
      key: "priority",
      label: t("maintenance.priority"),
      render: (m: MaintenanceRequest) => <StatusBadge status={m.priority} />,
    },
    {
      key: "status",
      label: t("maintenance.status"),
      render: (m: MaintenanceRequest) => <StatusBadge status={m.status} />,
    },
    {
      key: "estimatedCost",
      label: t("maintenance.estimatedCost"),
      render: (m: MaintenanceRequest) =>
        m.estimatedCost ? `${m.estimatedCost.toLocaleString()} ETB` : "—",
    },
    {
      key: "requestedAt",
      label: t("maintenance.requested"),
      render: (m: MaintenanceRequest) =>
        new Date(m.requestedAt).toLocaleDateString(),
    },
    ...(canUpdate
      ? [
          {
            key: "actions",
            label: "Actions",
            render: (m: MaintenanceRequest) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openUpdateDialog(m)}
              >
                <Edit size={14} className="mr-1" />
                Update
              </Button>
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
          <h1 className="page-title">{t("maintenance.title")}</h1>
          <p className="page-subtitle">{t("maintenance.subtitle")}</p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />{" "}
                {t("maintenance.requestMaintenance")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("maintenance.requestMaintenance")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("maintenance.vehicle")}</Label>
                  <Select
                    value={form.vehicleId}
                    onValueChange={(v) => setForm({ ...form, vehicleId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("maintenance.vehicle")} />
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
                    <Label>{t("maintenance.type")}</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          type: v as MaintenanceRequest["type"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["routine", "repair", "emergency"].map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {t(`maintenance.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("maintenance.priority")}</Label>
                    <Select
                      value={form.priority}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          priority: v as MaintenanceRequest["priority"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["low", "medium", "high", "critical"].map((p) => (
                          <SelectItem key={p} value={p} className="capitalize">
                            {t(`maintenance.${p}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("maintenance.description")}</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("maintenance.estimatedCost")} (ETB)</Label>
                  <Input
                    type="number"
                    value={form.estimatedCost}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estimatedCost: Number(e.target.value),
                      })
                    }
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
        data={requests}
        searchKeys={["description"]}
      />

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Maintenance Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="text-sm font-medium">
                  Vehicle: {getPlate(selectedRequest.vehicleId)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.description}
                </p>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={updateForm.status}
                    onValueChange={(v) =>
                      setUpdateForm({
                        ...updateForm,
                        status: v as MaintenanceRequest["status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["pending", "in_progress", "completed", "cancelled"].map(
                        (status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="capitalize"
                          >
                            {status.replace("_", " ")}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estimated Cost (ETB)</Label>
                    <Input
                      type="number"
                      value={updateForm.estimatedCost}
                      onChange={(e) =>
                        setUpdateForm({
                          ...updateForm,
                          estimatedCost: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Actual Cost (ETB)</Label>
                    <Input
                      type="number"
                      value={updateForm.actualCost}
                      onChange={(e) =>
                        setUpdateForm({
                          ...updateForm,
                          actualCost: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={updateForm.notes}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, notes: e.target.value })
                    }
                    placeholder="Add notes about the work done..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setUpdateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
