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
import TrainingModal, {
  type TrainingFormData,
} from "../components/TrainingModal";
import { createTraining, updateTraining, deleteTraining } from "../api";

export default function Training() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] =
    useState<TrainingProgram | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [programsRes, enrollmentsRes] = await Promise.all([
        fetchTrainingPrograms(),
        // fetchTrainingEnrollments("") is no longer needed for counts; keep as fallback
        fetchTrainingEnrollments("").catch(() => ({ data: [] })),
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

  const handleDeleteTraining = async (id: string) => {
    try {
      await deleteTraining(id);
      setToast({ type: "success", message: "Training deleted" });
      await fetchData();
    } catch (error) {
      console.error("Error deleting training:", error);
      setToast({ type: "error", message: "Failed to delete training" });
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Schedule Training
        </button>
      </div>
      <TrainingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data: TrainingFormData) => {
          if (selectedProgram) {
            await updateTraining(
              selectedProgram.id,
              data as unknown as Record<string, unknown>
            );
            setToast({ type: "success", message: "Training updated" });
            setSelectedProgram(null);
          } else {
            await createTraining(data as unknown as Record<string, unknown>);
            setToast({ type: "success", message: "Training created" });
          }
          await fetchData();
        }}
        initialData={
          selectedProgram
            ? ({
                title: selectedProgram.title,
                description: selectedProgram.description,
                trainer: selectedProgram.trainer,
                start_date: selectedProgram.start_date,
                end_date: selectedProgram.end_date,
                location: selectedProgram.location,
                capacity: selectedProgram.capacity,
                cost_per_person: selectedProgram.cost_per_person,
                status: selectedProgram.status,
              } as Partial<TrainingFormData>)
            : null
        }
        employees={[]}
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
                    <svg
                      className="w-full h-full block"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient
                          id="trainingGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#0A1931" />
                          <stop offset="100%" stopColor="#4A7FA7" />
                        </linearGradient>
                      </defs>
                      <rect
                        x="0"
                        y="0"
                        width={Math.min(capacityPercentage, 100)}
                        height="10"
                        fill="url(#trainingGrad)"
                        rx="999"
                      />
                    </svg>
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
                <div className="flex gap-2 mt-4">
                  <button
                    className="px-3 py-2 rounded-lg bg-[#F6FAFD] text-[#0A1931]"
                    onClick={() => {
                      setSelectedProgram(program);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg bg-[#EEF7FF] text-[#0A1931]"
                    onClick={async () => {
                      // open enrollments modal
                      setSelectedProgram(program);
                      setLoading(true);
                      try {
                        const res: unknown = await fetchTrainingEnrollments(
                          program.id
                        );
                        let data: unknown[] = [];
                        if (Array.isArray(res)) data = res;
                        else if (
                          res &&
                          typeof res === "object" &&
                          Array.isArray((res as { data?: unknown }).data)
                        ) {
                          data = (res as { data?: unknown }).data as unknown[];
                        }
                        setEnrollments(data as TrainingEnrollment[]);
                      } catch (err) {
                        console.error(err);
                        setEnrollments([]);
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    View Enrollments
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-600"
                    onClick={() => setConfirmDeleteId(program.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete confirm */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Confirm delete</h3>
              <p className="mb-6">
                Are you sure you want to delete this training program?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 rounded-xl border"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-red-500 text-white"
                  onClick={() => {
                    if (confirmDeleteId) handleDeleteTraining(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 p-4 rounded-xl text-white ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        )}

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No training programs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Enrollments drawer/modal */}
      {selectedProgram && !isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Enrollments - {selectedProgram.title}
              </h3>
              <button
                className="px-3 py-2 rounded-lg"
                onClick={() => {
                  setSelectedProgram(null);
                  setEnrollments([]);
                }}
              >
                Close
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                Loading...
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No enrollments found for this program.
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enr) => (
                  <div key={enr.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{enr.employee_id}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(enr.enrollment_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {enr.attendance_status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
