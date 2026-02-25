import { useState } from "react";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ROLE_LABELS, type Role } from "@/types";
import {
  LayoutDashboard,
  Users,
  Car,
  CalendarDays,
  Fuel,
  Wrench,
  LogOut as LogOutIcon,
  Shield,
  FileText,
  Menu,
  X,
  ChevronRight,
  Bus,
} from "lucide-react";

interface NavItemDef {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
}

const NAV_ITEMS: NavItemDef[] = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} />, roles: ["system_admin", "security_guard", "driver", "mechanic", "scheduler", "vehicle_manager", "user"] },
  { label: "User Management", path: "/users", icon: <Users size={20} />, roles: ["system_admin"] },
  { label: "Vehicles", path: "/vehicles", icon: <Car size={20} />, roles: ["vehicle_manager", "scheduler"] },
  { label: "Schedules", path: "/schedules", icon: <CalendarDays size={20} />, roles: ["system_admin", "driver", "scheduler", "vehicle_manager", "user"] },
  { label: "Fuel Balance", path: "/fuel", icon: <Fuel size={20} />, roles: ["vehicle_manager"] },
  { label: "Maintenance", path: "/maintenance", icon: <Wrench size={20} />, roles: ["driver", "mechanic", "vehicle_manager"] },
  { label: "Exit Workflow", path: "/exit", icon: <Shield size={20} />, roles: ["driver", "vehicle_manager", "security_guard"] },
  { label: "Reports", path: "/reports", icon: <FileText size={20} />, roles: ["system_admin", "vehicle_manager"] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "hsl(var(--sidebar-background))" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: "hsl(var(--sidebar-primary))" }}>
            <Bus size={20} style={{ color: "hsl(var(--sidebar-primary-foreground))" }} />
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: "hsl(var(--sidebar-foreground))" }}>Fleet Manager</h1>
            <p className="text-xs" style={{ color: "hsl(var(--sidebar-muted))" }}>Haramaya University</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} style={{ color: "hsl(var(--sidebar-foreground))" }} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <RouterNavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} style={{ color: "hsl(var(--sidebar-primary))" }} />}
              </RouterNavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "hsl(var(--sidebar-primary))", color: "hsl(var(--sidebar-primary-foreground))" }}>
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "hsl(var(--sidebar-foreground))" }}>{user.fullName}</p>
              <p className="text-xs truncate" style={{ color: "hsl(var(--sidebar-muted))" }}>{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: "hsl(var(--sidebar-foreground))" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--sidebar-accent))")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOutIcon size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 sm:px-6 py-3 bg-card border-b border-border">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-muted" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="badge-role bg-secondary text-secondary-foreground">
            {ROLE_LABELS[user.role]}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
