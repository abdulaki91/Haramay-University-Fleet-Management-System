import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socketService } from "@/services/socket.service";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";

export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    // Connect to socket when user is authenticated
    socketService.connect();

    // New Notification System Events
    socketService.on("notification:new", (notification: any) => {
      console.log("📢 New notification:", notification);

      // Show toast notification with priority-based styling
      const variant =
        notification.priority === "critical" || notification.priority === "high"
          ? "destructive"
          : "default";

      toast({
        title: notification.title,
        description: notification.message,
        variant,
        duration: notification.priority === "critical" ? 8000 : 5000,
      });

      // Refresh notification queries
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    });

    // Exit Request Events
    socketService.on("exit_request:created", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["exitRequests"] });
      if (user.role === "vehicle_manager") {
        toast({
          title: "New Exit Request 🚗",
          description: `Driver requests exit to ${data.destination || "destination"}`,
          duration: 6000,
        });
      }
    });

    socketService.on("exit_request:approved", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["exitRequests"] });
      if (user.role === "driver" && data.driverId === user.id) {
        toast({
          title: "Exit Request Approved ✅",
          description: `Your request for ${data.destination || "exit"} has been approved`,
          duration: 6000,
        });
      } else if (user.role === "security_guard") {
        toast({
          title: "New Approved Exit 🚪",
          description: `Vehicle exit approved for ${data.destination || "destination"}`,
          duration: 5000,
        });
      }
    });

    socketService.on("exit_request:rejected", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["exitRequests"] });
      if (user.role === "driver" && data.driverId === user.id) {
        toast({
          title: "Exit Request Rejected ❌",
          description: `Your request for ${data.destination || "exit"} was rejected`,
          variant: "destructive",
          duration: 7000,
        });
      }
    });

    // Maintenance Events
    socketService.on("maintenance:created", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      if (user.role === "vehicle_manager" || user.role === "mechanic") {
        toast({
          title: "New Maintenance Request 🔧",
          description: `${data.title || "Maintenance needed"} - Priority: ${data.priority || "medium"}`,
          duration: 6000,
        });
      }
    });

    socketService.on("maintenance:updated", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      if (user.role === "vehicle_manager") {
        toast({
          title: "Maintenance Updated 🔄",
          description: `${data.title || "Maintenance"} - Status: ${data.status || "updated"}`,
          duration: 4000,
        });
      }
    });

    socketService.on("maintenance:assigned", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      if (user.role === "mechanic" && data.assignedTo === user.id) {
        toast({
          title: "Maintenance Assigned 👨‍🔧",
          description: `You've been assigned: ${data.title || "maintenance task"}`,
          duration: 6000,
        });
      }
    });

    socketService.on("maintenance:completed", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      if (user.role === "vehicle_manager") {
        toast({
          title: "Maintenance Completed ✅",
          description: `${data.title || "Maintenance"} has been completed`,
          duration: 5000,
        });
      }
    });

    // Vehicle Events
    socketService.on("vehicle:updated", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      if (user.role === "vehicle_manager") {
        toast({
          title: "Vehicle Updated 🚙",
          description: `Vehicle ${data.plateNumber || "status"} has been updated`,
          duration: 4000,
        });
      }
    });

    socketService.on("vehicle:status_changed", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      if (user.role === "vehicle_manager" || user.role === "scheduler") {
        toast({
          title: "Vehicle Status Changed 📊",
          description: `${data.plateNumber || "Vehicle"} is now ${data.status || "updated"}`,
          duration: 4000,
        });
      }
    });

    // Schedule Events
    socketService.on("schedule:created", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      if (user.role === "driver" && data.driverId === user.id) {
        toast({
          title: "New Schedule Assignment 📅",
          description: `${data.purpose || "Trip"} to ${data.destination || "destination"}`,
          duration: 6000,
        });
      }
    });

    socketService.on("schedule:updated", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      if (user.role === "driver" && data.driverId === user.id) {
        toast({
          title: "Schedule Updated 📝",
          description: `Your schedule for ${data.destination || "trip"} has been modified`,
          duration: 5000,
        });
      }
    });

    socketService.on("schedule:cancelled", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      if (user.role === "driver" && data.driverId === user.id) {
        toast({
          title: "Schedule Cancelled ❌",
          description: `Your schedule for ${data.destination || "trip"} has been cancelled`,
          variant: "destructive",
          duration: 6000,
        });
      }
    });

    // Fuel Events
    socketService.on("fuel:low_alert", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["fuel"] });
      if (user.role === "vehicle_manager") {
        toast({
          title: "Low Fuel Alert ⛽",
          description: `${data.plateNumber || "Vehicle"} needs refueling`,
          variant: "destructive",
          duration: 7000,
        });
      }
    });

    socketService.on("fuel:added", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["fuel"] });
      if (user.role === "vehicle_manager") {
        toast({
          title: "Fuel Added ⛽",
          description: `${data.plateNumber || "Vehicle"} has been refueled`,
          duration: 4000,
        });
      }
    });

    // System Events
    socketService.on("system:alert", (data: any) => {
      toast({
        title: "System Alert 🚨",
        description: data.message || "Important system notification",
        variant: "destructive",
        duration: 8000,
      });
    });

    // User Events
    socketService.on("user:role_changed", (data: any) => {
      if (data.userId === user.id) {
        toast({
          title: "Role Updated 👤",
          description: `Your role has been changed to ${data.newRole}`,
          duration: 6000,
        });
        // Refresh user data
        queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      }
    });

    // Cleanup on unmount
    return () => {
      // Remove all listeners
      const events = [
        "notification:new",
        "exit_request:created",
        "exit_request:approved",
        "exit_request:rejected",
        "maintenance:created",
        "maintenance:updated",
        "maintenance:assigned",
        "maintenance:completed",
        "vehicle:updated",
        "vehicle:status_changed",
        "schedule:created",
        "schedule:updated",
        "schedule:cancelled",
        "fuel:low_alert",
        "fuel:added",
        "system:alert",
        "user:role_changed",
      ];

      events.forEach((event) => socketService.off(event));
    };
  }, [user, queryClient, toast]);
};
