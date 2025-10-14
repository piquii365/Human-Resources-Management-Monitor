import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { PerformanceEvaluation, Employee } from "../lib/types";
import { Plus, Search, FileText, CheckCircle, Clock } from "lucide-react";

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [evaluationsRes, employeesRes] = await Promise.all([
        supabase
          .from("performance_evaluations")
          .select("*")
          .order("evaluation_date", { ascending: false }),
        supabase.from("employees").select("*"),
      ]);

      if (evaluationsRes.data) setEvaluations(evaluationsRes.data);
      if (employeesRes.data) setEmployees(employeesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee
      ? `${employee.first_name} ${employee.last_name}`
      : "Unknown";
  };

  const filteredEvaluations = evaluations.filter((evaluation) => {
    const employeeName = getEmployeeName(evaluation.employee_id);
    const matchesSearch =
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.evaluation_period
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || evaluation.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="text-green-500" size={20} />;
      case "submitted":
        return <Clock className="text-blue-500" size={20} />;
      default:
        return <FileText className="text-gray-400" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1931]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1931]">
            Performance Evaluations
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage employee performance reviews
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white rounded-xl hover:shadow-lg transition-all">
          <Plus size={20} />
          New Evaluation
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search evaluations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#B3CFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]"
            />
          </div>
          <select
            title="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-[#B3CFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="border border-[#B3CFE5] rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-100/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0A1931]">
                    {getEmployeeName(evaluation.employee_id)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {evaluation.evaluation_period}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(evaluation.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#F6FAFD] rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-1">Overall Score</p>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(
                      evaluation.performance_score
                    )}`}
                  >
                    {evaluation.performance_score}%
                  </p>
                </div>
                <div className="bg-[#F6FAFD] rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-1">Goals Met</p>
                  <p className="text-2xl font-bold text-[#0A1931]">
                    {evaluation.goals_met ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Technical Skills</span>
                  <span className="font-medium text-[#0A1931]">
                    {evaluation.technical_skills}/10
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Communication</span>
                  <span className="font-medium text-[#0A1931]">
                    {evaluation.communication}/10
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Teamwork</span>
                  <span className="font-medium text-[#0A1931]">
                    {evaluation.teamwork}/10
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Leadership</span>
                  <span className="font-medium text-[#0A1931]">
                    {evaluation.leadership}/10
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#B3CFE5]">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    evaluation.status
                  )}`}
                >
                  {evaluation.status}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(evaluation.evaluation_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredEvaluations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No evaluations found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
