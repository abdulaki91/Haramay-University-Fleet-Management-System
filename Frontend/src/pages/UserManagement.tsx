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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
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
import { ROLE_LABELS, type Role, type User } from "@/types";
import { useState } from "react";
import { Plus, Pencil, Trash2, Copy, Check } from "lucide-react";
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
  const [credentialsDialog, setCredentialsDialog] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState<{
    email: string;
    password: string;
    fullName: string;
  } | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    role: "user" as Role,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<User>) => {
      console.log("Creating user with data:", data);
      return userService.create(data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDialogOpen(false);

      // Show credentials dialog with generated password
      const password = `${variables.username}@123`;
      setNewUserCredentials({
        email: variables.email || "",
        password: password,
        fullName: variables.fullName || "",
      });
      setCredentialsDialog(true);

      setForm({ fullName: "", email: "", username: "", role: "user" });
      toast({ title: t("users.userCreated") });
    },
    onError: (error: any) => {
      console.error("User creation error:", error);
      console.error("Error response:", error.response);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create user";
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: t("users.userDeleted") });
    },
    onError: (error: any) => {
      console.error("User deletion error:", error);
      toast({
        title: t("common.error"),
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
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
    console.log("Submitting user form:", form);

    if (editingUser) {
      userService
        .update(editingUser.id, { ...form, isActive: true })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          setDialogOpen(false);
          setForm({ fullName: "", email: "", username: "", role: "user" });
          toast({ title: t("users.userUpdated") });
        })
        .catch((error) => {
          console.error("User update error:", error);
          toast({
            title: t("common.error"),
            description:
              error.response?.data?.message || "Failed to update user",
            variant: "destructive",
          });
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

      {/* Credentials Dialog */}
      <AlertDialog open={credentialsDialog} onOpenChange={setCredentialsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  The user account has been created. Please share these
                  credentials with{" "}
                  <strong>{newUserCredentials?.fullName}</strong>:
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-mono font-semibold">
                        {newUserCredentials?.email}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          newUserCredentials?.email || "",
                        );
                        toast({ title: "Email copied!" });
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Password</p>
                      <p className="font-mono font-semibold">
                        {newUserCredentials?.password}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          newUserCredentials?.password || "",
                        );
                        toast({ title: "Password copied!" });
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ <strong>Important:</strong> Ask the user to change their
                    password after first login for security.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
