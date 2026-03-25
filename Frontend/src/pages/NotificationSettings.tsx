import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationService,
  type NotificationPreference,
} from "@/api/services/notification.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Bell, Mail, Monitor, Smartphone } from "lucide-react";

const channelIcons = {
  web: Monitor,
  email: Mail,
  sms: Smartphone,
};

const channelLabels = {
  web: "Web Notifications",
  email: "Email Notifications",
  sms: "SMS Notifications",
};

export default function NotificationSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);

  // Get notification preferences
  const { data, isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: notificationService.getPreferences,
  });

  // Set preferences when data is loaded
  useEffect(() => {
    if (data) {
      setPreferences(data);
    }
  }, [data]);

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: notificationService.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast({ title: "Notification preferences updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
    },
  });

  const handleToggleEnabled = (index: number) => {
    const updated = [...preferences];
    updated[index].enabled = !updated[index].enabled;
    setPreferences(updated);
  };

  const handleToggleChannel = (index: number, channel: string) => {
    const updated = [...preferences];
    const channels = updated[index].channels;

    if (channels.includes(channel)) {
      updated[index].channels = channels.filter((c) => c !== channel);
    } else {
      updated[index].channels = [...channels, channel];
    }

    setPreferences(updated);
  };

  const handleSave = () => {
    const updateData = preferences.map((pref, index) => ({
      typeId: parseInt(pref.id),
      channels: pref.channels,
      enabled: pref.enabled,
    }));

    updateMutation.mutate(updateData);
  };

  const getNotificationTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      maintenance_due: "Alerts when vehicle maintenance is due or overdue",
      fuel_low: "Notifications when vehicle fuel level is low",
      schedule_assigned: "Alerts when you are assigned to a new schedule",
      schedule_updated: "Notifications when your schedule is modified",
      schedule_cancelled: "Alerts when your schedule is cancelled",
      exit_request_approved: "Notifications when your exit request is approved",
      exit_request_rejected: "Alerts when your exit request is rejected",
      maintenance_completed:
        "Notifications when vehicle maintenance is completed",
      vehicle_status_changed: "Alerts when vehicle status is updated",
      system_alert: "Important system-wide notifications",
    };

    return descriptions[type] || "System notification";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading notification settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell size={24} />
            Notification Settings
          </h1>
          <p className="page-subtitle">
            Manage how and when you receive notifications
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {preferences.map((preference, index) => (
          <Card key={preference.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg capitalize">
                    {preference.type.replace(/_/g, " ")}
                  </CardTitle>
                  <CardDescription>
                    {getNotificationTypeDescription(preference.type)}
                  </CardDescription>
                </div>
                <Switch
                  checked={preference.enabled}
                  onCheckedChange={() => handleToggleEnabled(index)}
                />
              </div>
            </CardHeader>
            {preference.enabled && (
              <CardContent>
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Delivery Channels
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {preference.defaultChannels.map((channel) => {
                      const Icon =
                        channelIcons[channel as keyof typeof channelIcons];
                      const isChecked = preference.channels.includes(channel);

                      return (
                        <div
                          key={channel}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleToggleChannel(index, channel)}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() =>
                              handleToggleChannel(index, channel)
                            }
                          />
                          <Icon size={18} className="text-muted-foreground" />
                          <Label className="cursor-pointer">
                            {
                              channelLabels[
                                channel as keyof typeof channelLabels
                              ]
                            }
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isLoading}
          className="min-w-32"
        >
          {updateMutation.isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
