import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "@/api/services";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle } from "@/types";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VehicleManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: vehicles = [], isLoading } = useQuery({ queryKey: ["vehicles"], queryFn: vehicleService.getAll });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ plateNumber: "", model: "", make: "", year: 2024, type: "sedan" as Vehicle["type"], fuelType: "diesel" as Vehicle["fuelType"], mileage: 0, status: "available" as Vehicle["status"] });

  const registerMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => vehicleService.register(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vehicles"] }); setDialogOpen(false); toast({ title: "Vehicle registered" }); },
  });

  const openCreate = () => { setEditing(null); setForm({ plateNumber: "", model: "", make: "", year: 2024, type: "sedan", fuelType: "diesel", mileage: 0, status: "available" }); setDialogOpen(true); };
  const openEdit = (v: Vehicle) => { setEditing(v); setForm({ plateNumber: v.plateNumber, model: v.model, make: v.make, year: v.year, type: v.type, fuelType: v.fuelType, mileage: v.mileage, status: v.status }); setDialogOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      vehicleService.update(editing.id, form).then(() => { queryClient.invalidateQueries({ queryKey: ["vehicles"] }); setDialogOpen(false); toast({ title: "Vehicle updated" }); });
    } else {
      registerMutation.mutate(form);
    }
  };

  const columns = [
    { key: "plateNumber", label: "Plate Number", render: (v: Vehicle) => <span className="font-mono font-medium">{v.plateNumber}</span> },
    { key: "make", label: "Make" },
    { key: "model", label: "Model" },
    { key: "year", label: "Year" },
    { key: "type", label: "Type", render: (v: Vehicle) => <span className="capitalize">{v.type}</span> },
    { key: "status", label: "Status", render: (v: Vehicle) => <StatusBadge status={v.status} /> },
    { key: "mileage", label: "Mileage", render: (v: Vehicle) => <span>{v.mileage.toLocaleString()} km</span> },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Vehicle Management</h1>
          <p className="page-subtitle">Register and manage university fleet vehicles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus size={16} className="mr-2" /> Register Vehicle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Vehicle" : "Register Vehicle"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Plate Number</Label><Input value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Make</Label><Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Model</Label><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Year</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} required /></div>
                <div className="space-y-2"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Vehicle["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["bus", "van", "pickup", "sedan", "truck"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Fuel Type</Label>
                  <Select value={form.fuelType} onValueChange={(v) => setForm({ ...form, fuelType: v as Vehicle["fuelType"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["diesel", "gasoline", "electric"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Mileage (km)</Label><Input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })} /></div>
                {editing && (
                  <div className="space-y-2"><Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Vehicle["status"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["available", "in_use", "maintenance", "retired"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">{editing ? "Update" : "Register"} Vehicle</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={vehicles} searchKeys={["plateNumber", "make", "model"]} actions={(v: Vehicle) => (
        <Button variant="outline" size="sm" onClick={() => openEdit(v)}><Pencil size={14} /></Button>
      )} />
    </div>
  );
}
