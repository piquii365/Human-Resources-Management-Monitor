import { useEffect, useState } from "react";
import type { Recruitment, Application, Department } from "../lib/types";
import {
  fetchRecruitments,
  fetchDepartments,
  fetchAllApplications,
} from "../api";
import { Plus, Search, Briefcase, Calendar, Users } from "lucide-react";
import JobPostingModal, {
  type JobPostingFormData,
} from "../components/JobPostingModal";
import { createRecruitment } from "../api";

export default function RecruitmentPage() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tasks = await Promise.allSettled([
        fetchRecruitments(),
        fetchAllApplications(),
        fetchDepartments(),
      ]);

      const normalize = (r: unknown) => {
        if (Array.isArray(r)) return r;
        if (r && typeof r === "object") {
          const maybe = r as { data?: unknown };
          if (Array.isArray(maybe.data)) return maybe.data;
        }
        return [] as unknown[];
      };

      // tasks[0] = recruitments, [1] = applications, [2] = departments
      if (tasks[0].status === "fulfilled")
        setRecruitments(
          normalize(
            (tasks[0] as PromiseFulfilledResult<unknown>).value
          ) as Recruitment[]
        );
      else
        console.warn(
          "Failed fetching recruitments:",
          (tasks[0] as PromiseRejectedResult).reason
        );

      if (tasks[1].status === "fulfilled")
        setApplications(
          normalize(
            (tasks[1] as PromiseFulfilledResult<unknown>).value
          ) as Application[]
        );
      else
        console.warn(
          "Failed fetching applications:",
          (tasks[1] as PromiseRejectedResult).reason
        );

      if (tasks[2].status === "fulfilled")
        setDepartments(
          normalize(
            (tasks[2] as PromiseFulfilledResult<unknown>).value
          ) as Department[]
        );
      else
        console.warn(
          "Failed fetching departments:",
          (tasks[2] as PromiseRejectedResult).reason
        );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find((d) => d.id === departmentId)?.name || "Unknown";
  };

  const getApplicationCount = (recruitmentId: string) => {
    return applications.filter((app) => app.recruitment_id === recruitmentId)
      .length;
  };

  const filteredRecruitments = recruitments.filter((recruitment) => {
    const matchesSearch =
      recruitment.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDepartmentName(recruitment.department_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || recruitment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      open: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      filled: "bg-blue-100 text-blue-800",
    };
    return styles[status as keyof typeof styles] || styles.open;
  };

  const isClosingSoon = (closingDate: string) => {
    const daysUntilClose = Math.ceil(
      (new Date(closingDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysUntilClose <= 7 && daysUntilClose > 0;
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
          <h1 className="text-3xl font-bold text-[#0A1931]">Recruitment</h1>
          <p className="text-gray-600 mt-1">
            Manage job postings and applications
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Post Job Opening
        </button>
      </div>
      <JobPostingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data: JobPostingFormData) => {
          await createRecruitment(data as unknown as Record<string, unknown>);
          await fetchData();
        }}
        departments={departments}
      />

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search job postings..."
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
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="filled">Filled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecruitments.map((recruitment) => {
            const applicationCount = getApplicationCount(recruitment.id);
            const closingSoon = isClosingSoon(recruitment.closing_date);

            return (
              <div
                key={recruitment.id}
                className="border border-[#B3CFE5] rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-100/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0A1931] to-[#1A3D63] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#0A1931] mb-1">
                      {recruitment.job_title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getDepartmentName(recruitment.department_id)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      recruitment.status
                    )}`}
                  >
                    {recruitment.status}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {recruitment.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#F6FAFD] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={16} className="text-[#4A7FA7]" />
                      <p className="text-xs text-gray-600">Applications</p>
                    </div>
                    <p className="text-xl font-bold text-[#0A1931]">
                      {applicationCount}
                    </p>
                  </div>
                  <div className="bg-[#F6FAFD] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase size={16} className="text-[#4A7FA7]" />
                      <p className="text-xs text-gray-600">Vacancies</p>
                    </div>
                    <p className="text-xl font-bold text-[#0A1931]">
                      {recruitment.vacancies}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#B3CFE5]">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>
                      Closes:{" "}
                      {new Date(recruitment.closing_date).toLocaleDateString()}
                    </span>
                  </div>
                  {closingSoon && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      Closing Soon
                    </span>
                  )}
                </div>

                {recruitment.position_type && (
                  <div className="mt-3">
                    <span className="px-3 py-1 bg-[#B3CFE5] text-[#0A1931] text-xs rounded-full font-medium">
                      {recruitment.position_type
                        .replace("_", " ")
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredRecruitments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No job postings found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
