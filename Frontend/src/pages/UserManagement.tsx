import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/api/services";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABELS, type Role, type User } from "@/types";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: userService.getAll });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", username: "", role: "user" as Role });

  const createMutation = useMutation({
    mutationFn: (data: Partial<User>) => userService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); setDialogOpen(false); toast({ title: "User created" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); toast({ title: "User deleted" }); },
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm({ fullName: "", email: "", username: "", role: "user" });
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ fullName: u.fullName, email: u.email, username: u.username, role: u.role });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      userService.update(editingUser.id, { ...form, isActive: true }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setDialogOpen(false);
        toast({ title: "User updated" });
      });
    } else {
      createMutation.mutate({ ...form, isActive: true });
    }
  };

  const columns = [
    { key: "fullName", label: "Name" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (u: User) => <span className="badge-role bg-secondary text-secondary-foreground">{ROLE_LABELS[u.role]}</span> },
    { key: "isActive", label: "Status", render: (u: User) => <StatusBadge status={u.isActive ? "active" : "retired"} /> },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system user accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus size={16} className="mr-2" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">{editingUser ? "Update" : "Create"} User</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKeys={["fullName", "username", "email"]}
        actions={(u: User) => (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => openEdit(u)}><Pencil size={14} /></Button>
            <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(u.id)} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
          </div>
        )}
      />
    </div>
  );
}
