import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import UserManagement from "@/pages/UserManagement";
import VehicleManagement from "@/pages/VehicleManagement";
import SchedulesPage from "@/pages/Schedules";
import FuelBalancePage from "@/pages/FuelBalance";
import MaintenancePage from "@/pages/Maintenance";
import ExitWorkflowPage from "@/pages/ExitWorkflow";
import ReportsPage from "@/pages/Reports";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={["system_admin"]}><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
      <Route path="/vehicles" element={<ProtectedRoute allowedRoles={["vehicle_manager", "scheduler"]}><AppLayout><VehicleManagement /></AppLayout></ProtectedRoute>} />
      <Route path="/schedules" element={<ProtectedRoute allowedRoles={["system_admin", "driver", "scheduler", "vehicle_manager", "user"]}><AppLayout><SchedulesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/fuel" element={<ProtectedRoute allowedRoles={["vehicle_manager"]}><AppLayout><FuelBalancePage /></AppLayout></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute allowedRoles={["driver", "mechanic", "vehicle_manager"]}><AppLayout><MaintenancePage /></AppLayout></ProtectedRoute>} />
      <Route path="/exit" element={<ProtectedRoute allowedRoles={["driver", "vehicle_manager", "security_guard"]}><AppLayout><ExitWorkflowPage /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={["system_admin", "vehicle_manager"]}><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
