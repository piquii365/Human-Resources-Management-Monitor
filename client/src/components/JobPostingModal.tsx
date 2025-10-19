import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Department } from "../lib/types";
import { useAuth } from "../contexts/AuthContext";

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobPostingFormData) => Promise<void>;
  departments: Department[];
}

export interface JobPostingFormData {
  job_title: string;
  department_id: string;
  requirements: string;
  description: string;
  vacancies: number;
  closing_date: string;
  posting_date?: string;
  position_type: string;
  status: "open" | "closed" | "filled";
  salary_range?: string;
  created_by?: string;
}

const initialFormData: JobPostingFormData = {
  job_title: "",
  department_id: "",
  requirements: "",
  description: "",
  vacancies: 1,
  closing_date: "",
  posting_date: new Date().toISOString().slice(0, 10),
  position_type: "full_time",
  status: "open",
  salary_range: "",
};

export default function JobPostingModal({
  isOpen,
  onClose,
  onSubmit,
  departments,
}: JobPostingModalProps) {
  const [formData, setFormData] = useState<JobPostingFormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof JobPostingFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setIsSubmitting(false);
      setServerError("");
    }
  }, [isOpen]);

  const getErrorMessage = (e: unknown) => {
    if (!e) return "";
    if (typeof e === "string") return e;
    if (typeof e === "object" && e !== null) {
      const maybe = e as { data?: unknown; message?: unknown };
      if (maybe.data && typeof maybe.data === "object") {
        const d = maybe.data as Record<string, unknown>;
        if (typeof d.message === "string") return d.message;
      }
      if (typeof maybe.message === "string") return maybe.message;
    }
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof JobPostingFormData, string>> = {};
    if (!formData.job_title.trim())
      newErrors.job_title = "Job title is required";
    if (!formData.department_id)
      newErrors.department_id = "Department is required";
    if (!formData.closing_date)
      newErrors.closing_date = "Closing date is required";
    if (formData.vacancies <= 0)
      newErrors.vacancies = "Vacancies must be at least 1";
    if (!formData.position_type)
      newErrors.position_type = "Position type is required";
    // optional: validate posting_date and salary_range format lightly
    if (
      formData.posting_date &&
      isNaN(new Date(formData.posting_date).getTime())
    )
      newErrors.posting_date = "Invalid posting date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setServerError("");
    try {
      const payload = { ...formData } as JobPostingFormData;
      // attach created_by from auth context if available
      if (user && typeof user.uid === "string") payload.created_by = user.uid;
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      console.error("Error creating job posting:", err);
      setServerError(getErrorMessage(err) || "Failed to create job posting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    const name = target.name as keyof JobPostingFormData;
    let value: string | number = target.value;
    if (target instanceof HTMLInputElement && target.type === "number")
      value = Number(target.value);
    setFormData((p) => ({ ...p, [name]: value } as JobPostingFormData));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden rounded-2xl">
      <div className="overflow-hidden rounded-2xl w-full max-w-2xl">
        <div
          tabIndex={0}
          className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto modal-content"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0A1931]">
              New Job Posting
            </h2>
            <button
              aria-label="Close"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Show the posting user and include hidden created_by field */}
            <div className="text-sm text-gray-600">
              {user ? (
                <span>
                  Posting as <strong>{user.name || user.email}</strong>
                </span>
              ) : (
                <span className="text-red-600">
                  You must be signed in to post a job.
                </span>
              )}
            </div>

            {/* hidden input so formData can contain created_by when serialized if needed */}
            <input type="hidden" name="created_by" value={user?.uid ?? ""} />
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
                {serverError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#0A1931] mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="e.g., Frontend Engineer"
                className={`w-full px-4 py-3 border rounded-xl ${
                  errors.job_title ? "border-red-500" : "border-[#B3CFE5]"
                }`}
              />
              {errors.job_title && (
                <p className="text-red-500 text-sm mt-1">{errors.job_title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="department_id"
                className="block text-sm font-medium text-[#0A1931] mb-2"
              >
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl ${
                  errors.department_id ? "border-red-500" : "border-[#B3CFE5]"
                }`}
                title="Select department"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A1931] mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Job description and responsibilities"
                className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A1931] mb-2">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                placeholder="Required qualifications, skills"
                className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="salary_range"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Salary Range
                </label>
                <input
                  id="salary_range"
                  name="salary_range"
                  value={formData.salary_range ?? ""}
                  onChange={handleChange}
                  placeholder="e.g., 40,000 - 60,000"
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                />
              </div>
              <div>
                <label
                  htmlFor="posting_date"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Posting Date
                </label>
                <input
                  id="posting_date"
                  type="date"
                  name="posting_date"
                  value={formData.posting_date ?? ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="vacancies"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Vacancies <span className="text-red-500">*</span>
                </label>
                <input
                  id="vacancies"
                  type="number"
                  name="vacancies"
                  value={formData.vacancies}
                  onChange={handleChange}
                  min={1}
                  className={`w-full px-4 py-3 border rounded-xl ${
                    errors.vacancies ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                />
              </div>
              <div>
                <label
                  htmlFor="closing_date"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Closing Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="closing_date"
                  type="date"
                  name="closing_date"
                  value={formData.closing_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl ${
                    errors.closing_date ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="position_type"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Position Type
                </label>
                <select
                  id="position_type"
                  name="position_type"
                  value={formData.position_type}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl ${
                    errors.position_type ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                >
                  <option value="full_time">Full time</option>
                  <option value="part_time">Part time</option>
                  <option value="contract">Contract</option>
                </select>
                {errors.position_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.position_type}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="filled">Filled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-[#B3CFE5] text-[#0A1931] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
