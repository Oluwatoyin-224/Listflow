import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, AlertTriangle, Flame, TrendingUp, ListTodo, Loader2 } from 'lucide-react';
import { fetchDashboardStats } from '@/lib/api';
import type { DashboardStats } from '@/types';

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof CheckCircle2;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${bgColor} mb-3`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchDashboardStats()
      .then((data) => {
        if (active) {
          setStats(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load dashboard');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (stats.completionRate / 100) * circumference;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your productivity at a glance.</p>
      </div>

      {/* Progress ring + summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-700"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{stats.completionRate}%</p>
                <p className="text-xs text-slate-500">Complete</p>
              </div>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-slate-900">Completion Rate</h2>
            <p className="text-sm text-slate-500 mt-1">
              {stats.total === 0
                ? 'No tasks yet. Add your first task to get started!'
                : stats.completionRate === 100
                ? 'All tasks completed. Great job!'
                : `You've completed ${stats.completed} of ${stats.total} tasks. Keep going!`}
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Total Tasks" value={stats.total} icon={ListTodo} color="text-slate-700" bgColor="bg-slate-100" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="text-emerald-600" bgColor="bg-emerald-100" />
        <StatCard label="Active" value={stats.active} icon={Circle} color="text-blue-600" bgColor="bg-blue-100" />
        <StatCard label="High Priority" value={stats.highPriority} icon={Flame} color="text-orange-600" bgColor="bg-orange-100" />
        <StatCard label="Overdue" value={stats.overdue} icon={TrendingUp} color="text-red-600" bgColor="bg-red-100" />
      </div>
    </div>
  );
}
