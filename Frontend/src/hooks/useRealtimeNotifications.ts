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

    // Exit Request Events
    socketService.on("exit_request:created", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["exitRequests"] });
      if (user.role === "vehicle_manager") {
        toast({
          title: "New Exit Request",
          description: `Driver has requested exit permission`,
        });
      }
    });

    socketService.on("exit_request:approved", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["exitRequests"] });
      toast({
        title: "Exit Request Approved",
        description: `Exit request has been approved`,
      });
    });

    socketService.on("exit_request:rejected", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["exitRequests"] });
      toast({
        title: "Exit Request Rejected",
        description: `Exit request has been rejected`,
        variant: "destructive",
      });
    });

    // Maintenance Events
    socketService.on("maintenance:created", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      if (user.role === "vehicle_manager" || user.role === "mechanic") {
        toast({
          title: "New Maintenance Request",
          description: `A new maintenance request has been submitted`,
        });
      }
    });

    socketService.on("maintenance:updated", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast({
        title: "Maintenance Updated",
        description: `Maintenance request status has been updated`,
      });
    });

    socketService.on("maintenance:assigned", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      if (user.role === "mechanic") {
        toast({
          title: "Maintenance Assigned",
          description: `You have been assigned a maintenance task`,
        });
      }
    });

    // Vehicle Events
    socketService.on("vehicle:updated", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    });

    // Schedule Events
    socketService.on("schedule:created", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      if (user.role === "driver") {
        toast({
          title: "New Schedule",
          description: `You have been assigned to a new schedule`,
        });
      }
    });

    socketService.on("schedule:updated", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    });

    // Cleanup on unmount
    return () => {
      socketService.off("exit_request:created");
      socketService.off("exit_request:approved");
      socketService.off("exit_request:rejected");
      socketService.off("maintenance:created");
      socketService.off("maintenance:updated");
      socketService.off("maintenance:assigned");
      socketService.off("vehicle:updated");
      socketService.off("schedule:created");
      socketService.off("schedule:updated");
    };
  }, [user, queryClient, toast]);
};
