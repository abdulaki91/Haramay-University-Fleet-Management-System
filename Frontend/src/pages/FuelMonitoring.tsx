import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/api/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Fuel,
  AlertTriangle,
  Clock,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface FuelStats {
  vehicles_needing_attention: number;
  critical_alerts: number;
  high_priority_alerts: number;
  total_alerts_last_week: number;
  vehicles_with_issues: Array<{
    id: number;
    plate_number: string;
    make: string;
    model: string;
    fuel_capacity: number;
    last_fuel_date: string;
    last_fuel_amount: number;
    days_since_fuel: number;
  }>;
  recent_alerts: Array<{
    id: number;
    title: string;
    message: string;
    priority: string;
    plate_number: string;
    urgency_level: string;
    created_at: string;
  }>;
}

export default function FuelMonitoringPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);

  const {
    data: fuelStats,
    isLoading,
    refetch,
  } = useQuery<FuelStats>({
    queryKey: ["fuel-monitoring-stats"],
    queryFn: () => notificationService.getFuelMonitoringStats(),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const checkFuelLevelsMutation = useMutation({
    mutationFn: () => notificationService.checkFuelLevels(),
    onSuccess: () => {
      toast({
        title: "Fuel Check Complete",
        description:
          "Fuel levels have been checked and notifications sent if needed.",
      });
      queryClient.invalidateQueries({ queryKey: ["fuel-monitoring-stats"] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Check Failed",
        description: error.message || "Failed to check fuel levels",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsChecking(false);
    },
  });

  const handleManualCheck = () => {
    setIsChecking(true);
    checkFuelLevelsMutation.mutate();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "HIGH":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "MEDIUM":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getDaysColor = (days: number) => {
    if (days >= 21) return "text-red-600 font-bold";
    if (days >= 14) return "text-orange-600 font-semibold";
    if (days >= 7) return "text-yellow-600";
    return "text-green-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">
          Loading fuel monitoring data...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fuel Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor fuel levels and receive alerts for vehicles needing
            attention
          </p>
        </div>
        <Button
          onClick={handleManualCheck}
          disabled={isChecking}
          variant="outline"
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Fuel className="h-4 w-4 mr-2" />
          )}
          {isChecking ? "Checking..." : "Check Fuel Levels"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vehicles Needing Attention
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fuelStats?.vehicles_needing_attention || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Vehicles with potential fuel issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {fuelStats?.critical_alerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Urgent fuel alerts this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {fuelStats?.high_priority_alerts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              High priority alerts this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Fuel className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fuelStats?.total_alerts_last_week || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All fuel alerts this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Needing Attention */}
      {fuelStats?.vehicles_with_issues &&
        fuelStats.vehicles_with_issues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Vehicles Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fuelStats.vehicles_with_issues.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-bold">
                        {vehicle.plate_number}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.make} {vehicle.model}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Last fuel:{" "}
                        </span>
                        <span className={getDaysColor(vehicle.days_since_fuel)}>
                          {vehicle.days_since_fuel} days ago
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Amount: </span>
                        <span>{vehicle.last_fuel_amount}L</span>
                      </div>
                      <Badge
                        variant={
                          vehicle.days_since_fuel >= 14
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {vehicle.days_since_fuel >= 21
                          ? "Critical"
                          : vehicle.days_since_fuel >= 14
                            ? "High"
                            : "Medium"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Recent Alerts */}
      {fuelStats?.recent_alerts && fuelStats.recent_alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Recent Fuel Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fuelStats.recent_alerts.slice(0, 10).map((alert) => (
                <Alert
                  key={alert.id}
                  className="border-l-4 border-l-orange-500"
                >
                  <div className="flex items-start gap-3">
                    {getUrgencyIcon(alert.urgency_level)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{alert.title}</span>
                        <Badge variant={getPriorityColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                      <AlertDescription className="text-sm">
                        {alert.message}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Issues */}
      {(!fuelStats?.vehicles_with_issues ||
        fuelStats.vehicles_with_issues.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              All Vehicles Look Good!
            </h3>
            <p className="text-muted-foreground text-center">
              No vehicles currently need fuel attention. The system is
              monitoring fuel levels automatically.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
