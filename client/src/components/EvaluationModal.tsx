import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Employee } from "../lib/types";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EvaluationFormData) => Promise<void>;
  employees: Employee[];
}

export interface EvaluationFormData {
  employee_id: string;
  evaluation_period: string;
  evaluation_date: string;
  performance_score: number;
  goals_met: boolean;
  technical_skills: number;
  communication: number;
  teamwork: number;
  leadership: number;
  status: "draft" | "submitted" | "approved";
  notes: string;
}

const initialFormData: EvaluationFormData = {
  employee_id: "",
  evaluation_period: "",
  evaluation_date: "",
  performance_score: 0,
  goals_met: false,
  technical_skills: 0,
  communication: 0,
  teamwork: 0,
  leadership: 0,
  status: "draft",
  notes: "",
};

export default function EvaluationModal({
  isOpen,
  onClose,
  onSubmit,
  employees,
}: EvaluationModalProps) {
  const [formData, setFormData] = useState<EvaluationFormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EvaluationFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setIsSubmitting(false);
      setServerError("");
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EvaluationFormData, string>> = {};
    if (!formData.employee_id) newErrors.employee_id = "Employee is required";
    if (!formData.evaluation_period.trim())
      newErrors.evaluation_period = "Evaluation period is required";
    if (!formData.evaluation_date)
      newErrors.evaluation_date = "Evaluation date is required";
    if (formData.performance_score < 0 || formData.performance_score > 100)
      newErrors.performance_score = "Score must be between 0 and 100";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (e: unknown) => {
    if (!e) return "";
    if (typeof e === "string") return e;
    if (typeof e === "object" && e !== null) {
      const maybe = e as { data?: unknown; message?: unknown };
      if (maybe.data && typeof maybe.data === "object" && maybe.data !== null) {
        const d = maybe.data as Record<string, unknown>;
        if (typeof d.message === "string") return d.message;
      }
      if (typeof maybe.message === "string") return maybe.message;
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setServerError("");
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: unknown) {
      console.error("Error submitting evaluation:", error);
      setServerError(getErrorMessage(error) || "Failed to create evaluation");
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
    const name = target.name as keyof EvaluationFormData;
    let val: string | number | boolean = target.value;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      val = (target as HTMLInputElement).checked;
    } else if (target instanceof HTMLInputElement && target.type === "number") {
      val = Number((target as HTMLInputElement).value);
    }
    setFormData((prev) => ({ ...prev, [name]: val } as EvaluationFormData));
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
              New Evaluation
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
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="employee_id"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  id="employee_id"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl ${
                    errors.employee_id ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                  title="Select employee"
                >
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </option>
                  ))}
                </select>
                {errors.employee_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.employee_id}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="evaluation_period"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Evaluation Period <span className="text-red-500">*</span>
                </label>
                <input
                  id="evaluation_period"
                  name="evaluation_period"
                  value={formData.evaluation_period}
                  onChange={handleChange}
                  placeholder="e.g., Q2 2025"
                  className={`w-full px-4 py-3 border rounded-xl ${
                    errors.evaluation_period
                      ? "border-red-500"
                      : "border-[#B3CFE5]"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="evaluation_date"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Evaluation Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="evaluation_date"
                  type="date"
                  name="evaluation_date"
                  value={formData.evaluation_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl ${
                    errors.evaluation_date
                      ? "border-red-500"
                      : "border-[#B3CFE5]"
                  }`}
                />
              </div>
              <div>
                <label
                  htmlFor="performance_score"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Performance Score (%) <span className="text-red-500">*</span>
                </label>
                <input
                  id="performance_score"
                  type="number"
                  name="performance_score"
                  value={formData.performance_score}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  placeholder="0 - 100"
                  className={`w-full px-4 py-3 border rounded-xl ${
                    errors.performance_score
                      ? "border-red-500"
                      : "border-[#B3CFE5]"
                  }`}
                />
                {errors.performance_score && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.performance_score}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="technical_skills"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Technical Skills (0-10)
                </label>
                <input
                  id="technical_skills"
                  type="number"
                  name="technical_skills"
                  value={formData.technical_skills}
                  onChange={handleChange}
                  min={0}
                  max={10}
                  placeholder="0 - 10"
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                />
              </div>
              <div>
                <label
                  htmlFor="communication"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Communication (0-10)
                </label>
                <input
                  id="communication"
                  type="number"
                  name="communication"
                  value={formData.communication}
                  onChange={handleChange}
                  min={0}
                  max={10}
                  placeholder="0 - 10"
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="teamwork"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Teamwork (0-10)
                </label>
                <input
                  id="teamwork"
                  type="number"
                  name="teamwork"
                  value={formData.teamwork}
                  onChange={handleChange}
                  min={0}
                  max={10}
                  placeholder="0 - 10"
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                />
              </div>
              <div>
                <label
                  htmlFor="leadership"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Leadership (0-10)
                </label>
                <input
                  id="leadership"
                  type="number"
                  name="leadership"
                  value={formData.leadership}
                  onChange={handleChange}
                  min={0}
                  max={10}
                  placeholder="0 - 10"
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-[#0A1931] mb-2"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Optional notes"
                className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
              />
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
                {isSubmitting ? "Saving..." : "Save Evaluation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
