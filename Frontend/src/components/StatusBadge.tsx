interface StatusBadgeProps {
  status: string;
  variant?: "default" | "outline";
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-success/15 text-success",
  approved: "bg-success/15 text-success",
  completed: "bg-success/15 text-success",
  active: "bg-success/15 text-success",
  in_use: "bg-info/15 text-info",
  in_progress: "bg-info/15 text-info",
  pending: "bg-warning/15 text-warning",
  maintenance: "bg-warning/15 text-warning",
  denied: "bg-destructive/15 text-destructive",
  cancelled: "bg-destructive/15 text-destructive",
  retired: "bg-muted text-muted-foreground",
  low: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
  routine: "bg-info/15 text-info",
  repair: "bg-warning/15 text-warning",
  emergency: "bg-destructive/15 text-destructive",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || "bg-muted text-muted-foreground";
  return (
    <span className={`badge-role ${colorClass}`}>
      {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}
