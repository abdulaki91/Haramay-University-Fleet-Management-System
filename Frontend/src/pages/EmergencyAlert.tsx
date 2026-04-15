import { useMutation, useQuery } from "@tanstack/react-query";
import { notificationService, vehicleService } from "@/api/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Phone, MapPin, Fuel, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function EmergencyAlertPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user)!;

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleService.getAll,
  });

  const [form, setForm] = useState({
    vehicleId: "",
    currentLocation: "",
    emergencyType: "fuel", // fuel, breakdown, accident
    description: "",
  });

  const emergencyAlertMutation = useMutation({
    mutationFn: (data: { vehicleId: string; currentLocation?: string }) =>
      notificationService.sendEmergencyFuelAlert(
        data.vehicleId,
        data.currentLocation,
      ),
    onSuccess: () => {
      toast({
        title: "🚨 Emergency Alert Sent!",
        description:
          "Emergency alert has been sent to vehicle managers. Help is on the way!",
        duration: 8000,
      });
      setForm({
        vehicleId: "",
        currentLocation: "",
        emergencyType: "fuel",
        description: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Alert Failed",
        description: error.message || "Failed to send emergency alert",
        variant: "destructive",
        duration: 6000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.vehicleId) {
      toast({
        title: "Vehicle Required",
        description: "Please select the vehicle that needs help",
        variant: "destructive",
      });
      return;
    }

    const alertData = {
      vehicleId: form.vehicleId,
      currentLocation: form.currentLocation || undefined,
    };

    emergencyAlertMutation.mutate(alertData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-red-600">
          Driver Emergency Alert
        </h1>
        <p className="text-muted-foreground mt-2">
          Send immediate help request when you're stranded or need urgent
          assistance
        </p>
      </div>

      {/* Emergency Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Fuel className="h-5 w-5" />
              Fuel Emergency
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Out of fuel or critically low fuel level
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Vehicle breakdown or mechanical issues
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Phone className="h-5 w-5" />
              Other Emergency
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Medical emergency or urgent assistance
          </CardContent>
        </Card>
      </div>

      {/* Emergency Alert Form */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Send Emergency Alert</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle Selection */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                <Fuel className="inline h-4 w-4 mr-2" />
                Which vehicle needs help? *
              </Label>
              <Select
                value={form.vehicleId}
                onValueChange={(v) => setForm({ ...form, vehicleId: v })}
                required
              >
                <SelectTrigger className="border-red-200">
                  <SelectValue placeholder="Select the vehicle that needs help" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">
                          {v.plateNumber}
                        </span>
                        <span className="text-muted-foreground">—</span>
                        <span>
                          {v.make} {v.model}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Location */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                <MapPin className="inline h-4 w-4 mr-2" />
                Where are you right now?
              </Label>
              <Input
                value={form.currentLocation}
                onChange={(e) =>
                  setForm({ ...form, currentLocation: e.target.value })
                }
                placeholder="e.g., Highway to Harar KM 25, Main Campus Gate, Downtown Haramaya"
                className="border-red-200"
              />
              <p className="text-xs text-muted-foreground">
                Be as specific as possible to help rescue teams find you quickly
              </p>
            </div>

            {/* Emergency Info */}
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>This will immediately notify:</strong>
                <br />• Vehicle Managers (who will coordinate rescue)
                <br />• System Administrators (for system-wide alerts)
                <br />• Security Team (for safety coordination)
                <br />
                <br />
                <strong>Your contact info will be shared:</strong> {user.email}
                <br />
                <strong>
                  Response team will contact you directly for assistance
                </strong>
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
              disabled={emergencyAlertMutation.isPending}
            >
              {emergencyAlertMutation.isPending ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Sending Emergency Alert...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  🚨 SEND EMERGENCY ALERT
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Help Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Need Immediate Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Emergency Contacts:</strong>
          </p>
          <div className="text-sm space-y-1">
            <p>📞 Vehicle Manager: +251-911-000-001</p>
            <p>📞 Security: +251-911-000-003</p>
            <p>🚨 Emergency Services: 911</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
