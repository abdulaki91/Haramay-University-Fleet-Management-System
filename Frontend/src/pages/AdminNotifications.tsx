import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/api/services/notification.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Plus,
  Trash2,
  AlertCircle,
  Info,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const priorityIcons = {
  low: Info,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: AlertTriangle,
};

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const roleOptions = [
  { value: "system_admin", label: "System Admin" },
  { value: "vehicle_manager", label: "Vehicle Manager" },
  { value: "scheduler", label: "Scheduler" },
  { value: "driver", label: "Driver" },
  { value: "mechanic", label: "Mechanic" },
  { value: "security_guard", label: "Security Guard" },
  { value: "user", label: "User" },
];

export default function AdminNotifications() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "system_alert",
    title: "",
    message: "",
    priority: "medium",
    targetRoles: [] as string[],
  });

  // Get all notifications (admin view)
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: notificationService.getAllAdmin,
  });

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: notificationService.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setOpen(false);
      setFormData({
        type: "system_alert",
        title: "",
        message: "",
        priority: "medium",
        targetRoles: [],
      });
      toast({ title: "Notification created successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast({ title: "Notification deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    },
  });

  // Trigger periodic checks mutation
  const triggerChecksMutation = useMutation({
    mutationFn: notificationService.triggerPeriodicChecks,
    onSuccess: () => {
      toast({ title: "Periodic checks triggered successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to trigger periodic checks",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      type: formData.type,
      title: formData.title,
      message: formData.message,
      priority: formData.priority,
      targetRoles:
        formData.targetRoles.length > 0 ? formData.targetRoles : undefined,
    });
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter((r) => r !== role)
        : [...prev.targetRoles, role],
    }));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell size={24} />
            Admin Notifications
          </h1>
          <p className="page-subtitle">
            Manage system notifications and alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => triggerChecksMutation.mutate()}
            disabled={triggerChecksMutation.isLoading}
            variant="outline"
          >
            <RefreshCw
              size={16}
              className={triggerChecksMutation.isLoading ? "animate-spin" : ""}
            />
            Trigger Checks
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
                <DialogDescription>
                  Send a notification to specific user roles
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Notification title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Notification message"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Roles (leave empty for all users)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {roleOptions.map((role) => (
                      <div
                        key={role.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={role.value}
                          checked={formData.targetRoles.includes(role.value)}
                          onCheckedChange={() => handleRoleToggle(role.value)}
                        />
                        <Label htmlFor={role.value} className="text-sm">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isLoading}>
                    {createMutation.isLoading ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Bell size={48} className="mx-auto mb-4 opacity-50" />
              <p>No notifications created yet</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const PriorityIcon = priorityIcons[notification.priority];
            return (
              <Card key={notification.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <PriorityIcon
                        size={20}
                        className="mt-1 text-muted-foreground"
                      />
                      <div>
                        <CardTitle className="text-lg">
                          {notification.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {notification.message}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(notification.id)}
                      disabled={deleteMutation.isLoading}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={priorityColors[notification.priority]}>
                        {notification.priority}
                      </Badge>
                      {notification.targetRoles?.length > 0 && (
                        <div className="flex gap-1">
                          {notification.targetRoles.map((role) => (
                            <Badge key={role} variant="outline">
                              {roleOptions.find((r) => r.value === role)
                                ?.label || role}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
