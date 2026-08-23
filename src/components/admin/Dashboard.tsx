import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface DashboardProps {
  onTabChange: (tab: string, patientId?: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    action: string;
    name: string;
    time: string;
    color: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      if (!profile) return;

      const today = new Date().toISOString().split('T')[0];

      const [patientCountRes, appointmentsRes, revenueRes, pendingRes] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('appointment_date', today),
        supabase.from('payments').select('amount').eq('status', 'paid'),
        supabase.from('payments').select('amount').eq('status', 'pending'),
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const pendingPayments = pendingRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      setStats({
        totalPatients: patientCountRes.count || 0,
        todayAppointments: appointmentsRes.count || 0,
        totalRevenue,
        pendingPayments,
      });

      // Fetch recent activity
      await fetchRecentActivity();
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities: Array<{ action: string; name: string; time: string; color: string }> = [];

      // Get recent patients
      const { data: recentPatients } = await supabase
        .from('patients')
        .select('full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentPatients) {
        recentPatients.forEach(p => {
          activities.push({
            action: 'New patient registered',
            name: p.full_name,
            time: getTimeAgo(new Date(p.created_at)),
            color: 'bg-blue-500'
          });
        });
      }

      // Get recent appointments
      const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('status, appointment_date, patients(full_name)')
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentAppointments) {
        recentAppointments.forEach(a => {
          const patient = Array.isArray(a.patients) ? a.patients[0] : a.patients;
          activities.push({
            action: a.status === 'completed' ? 'Appointment completed' : 'Appointment scheduled',
            name: patient?.full_name || 'Unknown',
            time: getTimeAgo(new Date(a.appointment_date)),
            color: a.status === 'completed' ? 'bg-green-500' : 'bg-teal-500'
          });
        });
      }

      // Get recent payments
      const { data: recentPayments } = await supabase
        .from('payments')
        .select('amount, status, created_at')
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentPayments) {
        recentPayments.forEach(p => {
          activities.push({
            action: 'Payment received',
            name: `$${Number(p.amount).toFixed(2)}`,
            time: getTimeAgo(new Date(p.created_at)),
            color: 'bg-emerald-500'
          });
        });
      }

      // Sort by time and take first 5
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgGlow: 'bg-blue-500/20',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      gradient: 'from-teal-500 via-cyan-500 to-teal-600',
      bgGlow: 'bg-teal-500/20',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      gradient: 'from-emerald-500 via-green-500 to-emerald-600',
      bgGlow: 'bg-emerald-500/20',
      trend: '+18%',
      trendUp: true,
    },
    {
      title: 'Pending Payments',
      value: `$${stats.pendingPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: 'from-amber-500 via-orange-500 to-amber-600',
      bgGlow: 'bg-amber-500/20',
      trend: '-8%',
      trendUp: false,
    },
  ];

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {profile?.full_name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-500 mt-1">Here's what's happening at your clinic today</p>
        </div>
        <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
          <Clock className="w-5 h-5 text-teal-600" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{currentTime}</p>
            <p className="text-xs text-gray-500">{currentDate}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`relative group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${loading ? 'animate-pulse' : ''
                }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background glow effect */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 ${stat.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Top gradient bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {!loading && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${stat.trendUp ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                      {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {stat.trend}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{loading ? '...' : stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-teal-500/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => onTabChange('appointments')}
              className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-left font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              + New Appointment
            </button>
            <button
              onClick={() => onTabChange('patients')}
              className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-left font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              + Register Patient
            </button>
            <button
              onClick={() => onTabChange('payments')}
              className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-left font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              + Record Payment
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className={`w-2 h-2 ${activity.color} rounded-full flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{activity.action}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.name}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
