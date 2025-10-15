import { useEffect, useState } from "react";
import type { TrainingProgram, TrainingEnrollment } from "../lib/types";
import { fetchTrainingPrograms, fetchTrainingEnrollments } from "../api";
import {
  Plus,
  Search,
  GraduationCap,
  Calendar,
  MapPin,
  Users,
} from "lucide-react";

export default function Training() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [programsRes, enrollmentsRes] = await Promise.all([
        fetchTrainingPrograms(),
        fetchTrainingEnrollments(""),
      ]);

      if (programsRes && programsRes.data)
        setPrograms(programsRes.data as TrainingProgram[]);
      if (enrollmentsRes && enrollmentsRes.data)
        setEnrollments(enrollmentsRes.data as TrainingEnrollment[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEnrollmentCount = (programId: string) => {
    return enrollments.filter((enr) => enr.training_program_id === programId)
      .length;
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.trainer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || program.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      planned: "bg-blue-100 text-blue-800",
      ongoing: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || styles.planned;
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days === 1 ? "1 day" : `${days} days`;
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
            Training Programs
          </h1>
          <p className="text-gray-600 mt-1">
            Manage employee training and development
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white rounded-xl hover:shadow-lg transition-all">
          <Plus size={20} />
          Schedule Training
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
              placeholder="Search training programs..."
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
            <option value="planned">Planned</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrograms.map((program) => {
            const enrollmentCount = getEnrollmentCount(program.id);
            const capacityPercentage =
              program.capacity > 0
                ? Math.round((enrollmentCount / program.capacity) * 100)
                : 0;

            return (
              <div
                key={program.id}
                className="border border-[#B3CFE5] rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-100/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0A1931] to-[#1A3D63] rounded-xl flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#0A1931] mb-1">
                      {program.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Trainer: {program.trainer || "TBA"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      program.status
                    )}`}
                  >
                    {program.status}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {program.description || "No description available"}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar size={16} className="text-[#4A7FA7]" />
                    <span>
                      {new Date(program.start_date).toLocaleDateString()} -{" "}
                      {new Date(program.end_date).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 bg-[#B3CFE5] text-[#0A1931] text-xs rounded-full">
                      {getDuration(program.start_date, program.end_date)}
                    </span>
                  </div>
                  {program.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin size={16} className="text-[#4A7FA7]" />
                      <span>{program.location}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#4A7FA7]" />
                      <span className="text-gray-600">Enrollment</span>
                    </div>
                    <span className="font-medium text-[#0A1931]">
                      {enrollmentCount} / {program.capacity}
                    </span>
                  </div>
                  <div className="h-2 bg-[#B3CFE5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0A1931] to-[#4A7FA7]"
                      style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {program.cost_per_person > 0 && (
                  <div className="pt-4 border-t border-[#B3CFE5]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Cost per person
                      </span>
                      <span className="text-lg font-bold text-[#0A1931]">
                        ${program.cost_per_person.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No training programs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
