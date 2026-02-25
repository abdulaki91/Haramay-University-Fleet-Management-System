import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleService, vehicleService } from "@/api/services";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import type { Schedule } from "@/types";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SchedulesPage() {
  const user = useAuthStore((s) => s.user)!;
  const canCreate = user.role === "scheduler";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: schedules = [], isLoading } = useQuery({ queryKey: ["schedules"], queryFn: scheduleService.getAll });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: vehicleService.getAll });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", destination: "", departureTime: "", returnTime: "", purpose: "", passengers: 1 });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Schedule>) => scheduleService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["schedules"] }); setDialogOpen(false); toast({ title: "Schedule created" }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, driverId: user.id, status: "pending" });
  };

  const columns = [
    { key: "destination", label: "Destination", render: (s: Schedule) => <span className="font-medium">{s.destination}</span> },
    { key: "purpose", label: "Purpose" },
    { key: "departureTime", label: "Departure", render: (s: Schedule) => new Date(s.departureTime).toLocaleString() },
    { key: "returnTime", label: "Return", render: (s: Schedule) => new Date(s.returnTime).toLocaleString() },
    { key: "passengers", label: "Passengers" },
    { key: "status", label: "Status", render: (s: Schedule) => <StatusBadge status={s.status} /> },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Vehicle Schedules</h1>
          <p className="page-subtitle">View and manage vehicle scheduling</p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus size={16} className="mr-2" /> Create Schedule</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Schedule</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label>Vehicle</Label>
                  <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>{vehicles.filter((v) => v.status === "available").map((v) => <SelectItem key={v.id} value={v.id}>{v.plateNumber} — {v.make} {v.model}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Destination</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Purpose</Label><Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Departure</Label><Input type="datetime-local" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Return</Label><Input type="datetime-local" value={form.returnTime} onChange={(e) => setForm({ ...form, returnTime: e.target.value })} required /></div>
                </div>
                <div className="space-y-2"><Label>Passengers</Label><Input type="number" min={1} value={form.passengers} onChange={(e) => setForm({ ...form, passengers: Number(e.target.value) })} /></div>
                <Button type="submit" className="w-full">Create Schedule</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <DataTable columns={columns} data={schedules} searchKeys={["destination", "purpose"]} />
    </div>
  );
}
