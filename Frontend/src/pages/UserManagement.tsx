import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/api/services";
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
import { ROLE_LABELS, type Role, type User } from "@/types";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function UserManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAll,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    role: "user" as Role,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<User>) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDialogOpen(false);
      toast({ title: t("users.userCreated") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: t("users.userDeleted") });
    },
  });

  const openCreate = () => {
    setEditingUser(null);
    setForm({ fullName: "", email: "", username: "", role: "user" });
    setDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({
      fullName: u.fullName,
      email: u.email,
      username: u.username,
      role: u.role,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      userService
        .update(editingUser.id, { ...form, isActive: true })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          setDialogOpen(false);
          toast({ title: t("users.userUpdated") });
        });
    } else {
      createMutation.mutate({ ...form, isActive: true });
    }
  };

  const columns = [
    { key: "fullName", label: t("users.fullName") },
    { key: "username", label: t("users.username") },
    { key: "email", label: t("users.email") },
    {
      key: "role",
      label: t("users.role"),
      render: (u: User) => (
        <span className="badge-role bg-secondary text-secondary-foreground">
          {ROLE_LABELS[u.role]}
        </span>
      ),
    },
    {
      key: "isActive",
      label: t("users.status"),
      render: (u: User) => (
        <StatusBadge status={u.isActive ? "active" : "retired"} />
      ),
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
          <h1 className="page-title">{t("users.title")}</h1>
          <p className="page-subtitle">{t("users.subtitle")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus size={16} className="mr-2" /> {t("users.addUser")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? t("users.editUser") : t("users.createUser")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("users.fullName")}</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("users.username")}</Label>
                <Input
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("users.email")}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("users.role")}</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v as Role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingUser ? t("common.update") : t("common.create")}{" "}
                {t("users.title")}
              </Button>
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
            <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
              <Pencil size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate(u.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      />
    </div>
  );
}
