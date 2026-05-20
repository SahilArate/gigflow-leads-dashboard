import { Users, UserPlus, TrendingUp, XCircle } from "lucide-react";
import { LeadStats } from "@/types";
import { StatsSkeleton } from "@/components/ui/Skeleton";

interface StatsCardsProps {
  stats?: LeadStats;
  isLoading: boolean;
}

const statConfig = [
  {
    key: "total",
    label: "Total Leads",
    icon: Users,
    color: "text-white",
    bg: "bg-zinc-800",
  },
  {
    key: "New",
    label: "New Leads",
    icon: UserPlus,
    color: "text-zinc-300",
    bg: "bg-zinc-900",
  },
  {
    key: "Qualified",
    label: "Qualified",
    icon: TrendingUp,
    color: "text-white",
    bg: "bg-zinc-800",
  },
  {
    key: "Lost",
    label: "Lost",
    icon: XCircle,
    color: "text-zinc-500",
    bg: "bg-zinc-900",
  },
] as const;

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) return <StatsSkeleton />;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
          </div>
          <p className="text-3xl font-semibold text-white">
            {stats?.[key] ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
}