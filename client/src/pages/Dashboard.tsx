import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Users, TrendingUp, Briefcase, GraduationCap } from "lucide-react";

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  openPositions: number;
  ongoingTrainings: number;
  recentEvaluations: number;
  pendingApplications: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    openPositions: 0,
    ongoingTrainings: 0,
    recentEvaluations: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [
        employeesRes,
        openPositionsRes,
        trainingsRes,
        evaluationsRes,
        applicationsRes,
      ] = await Promise.all([
        supabase
          .from("employees")
          .select("id, employment_status", { count: "exact" }),
        supabase
          .from("recruitment")
          .select("id", { count: "exact" })
          .eq("status", "open"),
        supabase
          .from("training_programs")
          .select("id", { count: "exact" })
          .eq("status", "ongoing"),
        supabase
          .from("performance_evaluations")
          .select("id", { count: "exact" })
          .gte(
            "evaluation_date",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          ),
        supabase
          .from("applications")
          .select("id", { count: "exact" })
          .eq("status", "pending"),
      ]);

      const activeEmployees =
        employeesRes.data?.filter((emp) => emp.employment_status === "active")
          .length || 0;

      setStats({
        totalEmployees: employeesRes.count || 0,
        activeEmployees,
        openPositions: openPositionsRes.count || 0,
        ongoingTrainings: trainingsRes.count || 0,
        recentEvaluations: evaluationsRes.count || 0,
        pendingApplications: applicationsRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      subtitle: `${stats.activeEmployees} active`,
      icon: Users,
      bgColor: "from-[#0A1931] to-[#1A3D63]",
    },
    {
      title: "Open Positions",
      value: stats.openPositions,
      subtitle: `${stats.pendingApplications} pending applications`,
      icon: Briefcase,
      bgColor: "from-[#1A3D63] to-[#4A7FA7]",
    },
    {
      title: "Ongoing Training",
      value: stats.ongoingTrainings,
      subtitle: "Active programs",
      icon: GraduationCap,
      bgColor: "from-[#4A7FA7] to-[#1A3D63]",
    },
    {
      title: "Recent Evaluations",
      value: stats.recentEvaluations,
      subtitle: "Last 30 days",
      icon: TrendingUp,
      bgColor: "from-[#1A3D63] to-[#0A1931]",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1931]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0A1931] mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Human Resources Monitoring & Evaluation System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${card.bgColor} rounded-2xl flex items-center justify-center mb-4`}
              >
                <Icon className="text-white" size={28} />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-[#0A1931] mb-1">
                  {card.value}
                </p>
                <p className="text-[#4A7FA7] text-xs">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50">
          <h2 className="text-xl font-bold text-[#0A1931] mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white rounded-xl hover:shadow-lg transition-all">
              Add New Employee
            </button>
            <button className="w-full text-left px-4 py-3 bg-[#B3CFE5] text-[#0A1931] rounded-xl hover:bg-[#4A7FA7] hover:text-white transition-all">
              Create Evaluation
            </button>
            <button className="w-full text-left px-4 py-3 bg-[#B3CFE5] text-[#0A1931] rounded-xl hover:bg-[#4A7FA7] hover:text-white transition-all">
              Post Job Opening
            </button>
            <button className="w-full text-left px-4 py-3 bg-[#B3CFE5] text-[#0A1931] rounded-xl hover:bg-[#4A7FA7] hover:text-white transition-all">
              Schedule Training
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50">
          <h2 className="text-xl font-bold text-[#0A1931] mb-4">
            System Overview
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Employee Engagement</span>
                <span className="text-[#0A1931] font-bold">85%</span>
              </div>
              <div className="h-2 bg-[#B3CFE5] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0A1931] to-[#4A7FA7] w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Training Completion</span>
                <span className="text-[#0A1931] font-bold">72%</span>
              </div>
              <div className="h-2 bg-[#B3CFE5] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1A3D63] to-[#4A7FA7] w-[72%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Evaluation Progress</span>
                <span className="text-[#0A1931] font-bold">91%</span>
              </div>
              <div className="h-2 bg-[#B3CFE5] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0A1931] to-[#1A3D63] w-[91%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
