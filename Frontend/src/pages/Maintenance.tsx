import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceService, vehicleService } from "@/api/services";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import type { MaintenanceRequest } from "@/types";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MaintenancePage() {
  const user = useAuthStore((s) => s.user)!;
  const canCreate = user.role === "driver";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: requests = [], isLoading } = useQuery({ queryKey: ["maintenance"], queryFn: maintenanceService.getAll });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: vehicleService.getAll });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", type: "routine" as MaintenanceRequest["type"], description: "", priority: "medium" as MaintenanceRequest["priority"], estimatedCost: 0 });

  const createMutation = useMutation({
    mutationFn: (data: Partial<MaintenanceRequest>) => maintenanceService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["maintenance"] }); setDialogOpen(false); toast({ title: "Maintenance request submitted" }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, requestedBy: user.id });
  };

  const getPlate = (id: string) => vehicles.find((v) => v.id === id)?.plateNumber || id;

  const columns = [
    { key: "vehicleId", label: "Vehicle", render: (m: MaintenanceRequest) => <span className="font-mono font-medium">{getPlate(m.vehicleId)}</span> },
    { key: "type", label: "Type", render: (m: MaintenanceRequest) => <StatusBadge status={m.type} /> },
    { key: "description", label: "Description" },
    { key: "priority", label: "Priority", render: (m: MaintenanceRequest) => <StatusBadge status={m.priority} /> },
    { key: "status", label: "Status", render: (m: MaintenanceRequest) => <StatusBadge status={m.status} /> },
    { key: "estimatedCost", label: "Est. Cost", render: (m: MaintenanceRequest) => m.estimatedCost ? `${m.estimatedCost.toLocaleString()} ETB` : "—" },
    { key: "requestedAt", label: "Requested", render: (m: MaintenanceRequest) => new Date(m.requestedAt).toLocaleDateString() },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p className="page-subtitle">{canCreate ? "Submit and track maintenance requests" : "View maintenance requests"}</p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus size={16} className="mr-2" /> Request Maintenance</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Maintenance</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Vehicle</Label>
                  <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>{vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.plateNumber} — {v.make} {v.model}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MaintenanceRequest["type"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["routine", "repair", "emergency"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as MaintenanceRequest["priority"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["low", "medium", "high", "critical"].map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Estimated Cost (ETB)</Label><Input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: Number(e.target.value) })} /></div>
                <Button type="submit" className="w-full">Submit Request</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <DataTable columns={columns} data={requests} searchKeys={["description"]} />
    </div>
  );
}
