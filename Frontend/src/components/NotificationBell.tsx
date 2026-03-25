import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationService,
  type Notification,
} from "@/api/services/notification.service";
import { socketService } from "@/services/socket.service";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const priorityIcons = {
  low: Info,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: AlertTriangle,
};

const priorityColors = {
  low: "text-blue-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  critical: "text-red-500",
};

export default function NotificationBell() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const user = useAuthStore((s) => s.user);

  // Monitor socket connection status
  useEffect(() => {
    const checkConnection = () => {
      setSocketConnected(socketService.isConnected());
    };

    // Check initial connection
    checkConnection();

    // Check connection status periodically
    const interval = setInterval(checkConnection, 2000);

    return () => clearInterval(interval);
  }, []);

  // Listen for socket events to refresh notification data
  useEffect(() => {
    const handleNewNotification = (notification: any) => {
      console.log("NotificationBell: Received new notification:", notification);
      // Immediately invalidate queries when a new notification arrives
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    };

    // Listen for notification events
    socketService.on("notification:new", handleNewNotification);

    // Cleanup
    return () => {
      socketService.off("notification:new", handleNewNotification);
    };
  }, [queryClient]);

  // Get unread count
  const {
    data: unreadCount = 0,
    error: unreadError,
    isLoading: unreadLoading,
  } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 5000, // Refetch every 5 seconds for more responsive updates
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Get notifications
  const {
    data: notifications = [],
    error: notificationsError,
    isLoading: notificationsLoading,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getAll(false),
    enabled: open, // Only fetch when popover is open
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Debug logging
  useEffect(() => {
    console.log("NotificationBell Debug:", {
      unreadCount,
      unreadError,
      unreadLoading,
      notifications,
      notificationsError,
      notificationsLoading,
      socketConnected,
    });
  }, [
    unreadCount,
    unreadError,
    unreadLoading,
    notifications,
    notificationsError,
    notificationsLoading,
    socketConnected,
  ]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
      toast({ title: "All notifications marked as read" });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
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

  const NotificationItem = ({
    notification,
  }: {
    notification: Notification;
  }) => {
    const PriorityIcon = priorityIcons[notification.priority];
    const isUnread = notification.status !== "read";

    return (
      <div
        className={cn(
          "p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors",
          isUnread && "bg-blue-50 dark:bg-blue-950/20",
        )}
        onClick={() => isUnread && handleMarkAsRead(notification.id)}
      >
        <div className="flex items-start gap-3">
          <PriorityIcon
            size={16}
            className={cn(
              "mt-1 flex-shrink-0",
              priorityColors[notification.priority],
            )}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4
                className={cn(
                  "text-sm font-medium truncate",
                  isUnread && "font-semibold",
                )}
              >
                {notification.title}
              </h4>
              {isUnread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(notification.createdAt)}
              </span>
              {notification.status === "read" && (
                <Check size={12} className="text-green-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold z-50 shadow-sm"
            >
              {unreadCount > 99 ? "99+" : String(unreadCount)}
            </Badge>
          )}
          {/* Socket connection indicator */}
          <div
            className={cn(
              "absolute -bottom-1 -right-1 w-2 h-2 rounded-full",
              socketConnected ? "bg-green-500" : "bg-red-500",
            )}
            title={socketConnected ? "Connected" : "Disconnected"}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {import.meta.env.DEV && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      console.log("Testing API calls...");

                      // Test unread count
                      const count = await notificationService.getUnreadCount();
                      console.log("Unread count response:", count);

                      // Test notifications list
                      const notifs = await notificationService.getAll(false);
                      console.log("Notifications response:", notifs);

                      toast({
                        title: "API Test Success",
                        description: `Count: ${count}, Notifications: ${notifs.length}`,
                      });
                    } catch (error) {
                      console.error("API test failed:", error);
                      toast({
                        title: "API Test Failed",
                        description: `Error: ${error.message}`,
                        variant: "destructive",
                      });
                    }
                  }}
                  className="text-xs"
                >
                  Test API
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log("Reconnecting socket...");
                    socketService.disconnect();
                    setTimeout(() => socketService.connect(), 1000);
                  }}
                  className="text-xs"
                >
                  Reconnect
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      console.log("Triggering periodic checks...");
                      await notificationService.triggerPeriodicChecks();
                      toast({
                        title: "Periodic Checks Triggered",
                        description: "Check for new notifications",
                      });
                    } catch (error) {
                      console.error("Failed to trigger checks:", error);
                      toast({
                        title: "Failed to Trigger Checks",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  }}
                  className="text-xs"
                >
                  Trigger Checks
                </Button>
                {user?.role === "system_admin" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          console.log("Creating test notification...");
                          await notificationService.createNotification({
                            type: "system_alert",
                            title: "Test Notification",
                            message:
                              "This is a test notification to verify the system is working.",
                            priority: "medium",
                            targetUsers: [Number(user.id)],
                          });
                          toast({
                            title: "Test Notification Created",
                            description: "Check if it appears in the bell",
                          });
                        } catch (error) {
                          console.error(
                            "Failed to create test notification:",
                            error,
                          );
                          toast({
                            title: "Failed to Create Test",
                            description: error.message,
                            variant: "destructive",
                          });
                        }
                      }}
                      className="text-xs"
                    >
                      Test Notif
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          console.log("Testing email configuration...");
                          await notificationService.testEmailConfig();
                          toast({
                            title: "Test Email Sent",
                            description: "Check your email inbox",
                          });
                        } catch (error) {
                          console.error("Failed to send test email:", error);
                          toast({
                            title: "Email Test Failed",
                            description: error.message,
                            variant: "destructive",
                          });
                        }
                      }}
                      className="text-xs"
                    >
                      Test Email
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const status =
                            await notificationService.getEmailStatus();
                          console.log("Email status:", status);
                          toast({
                            title: "Email Status",
                            description: `Configured: ${status.configured}, Connected: ${status.connected}`,
                          });
                        } catch (error) {
                          console.error("Failed to get email status:", error);
                          toast({
                            title: "Status Check Failed",
                            description: error.message,
                            variant: "destructive",
                          });
                        }
                      }}
                      className="text-xs"
                    >
                      Email Status
                    </Button>
                  </>
                )}
              </>
            )}
            {!socketConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["notifications"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["notifications", "unread-count"],
                  });
                }}
                className="text-xs"
              >
                Refresh
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck size={14} className="mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell size={48} className="mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
