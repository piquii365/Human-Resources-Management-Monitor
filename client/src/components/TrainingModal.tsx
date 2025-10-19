import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Employee } from "../lib/types";

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TrainingFormData) => Promise<void>;
  employees: Employee[]; // for trainer selection if needed
  initialData?: Partial<TrainingFormData> | null;
}

export interface TrainingFormData {
  title: string;
  description: string;
  trainer: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  cost_per_person: number;
  status: "planned" | "ongoing" | "completed" | "cancelled";
}

const initialFormData: TrainingFormData = {
  title: "",
  description: "",
  trainer: "",
  start_date: "",
  end_date: "",
  location: "",
  capacity: 0,
  cost_per_person: 0,
  status: "planned",
};

export default function TrainingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}: TrainingModalProps) {
  const [formData, setFormData] = useState<TrainingFormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof TrainingFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setIsSubmitting(false);
      setServerError("");
    } else if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData } as TrainingFormData));
    }
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TrainingFormData, string>> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    if (formData.capacity < 0)
      newErrors.capacity = "Capacity must be 0 or more";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setServerError("");
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      console.error("Error creating training:", err);
      setServerError(getErrorMessage(err) || "Failed to create training");
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
    const name = target.name as keyof TrainingFormData;
    let value: string | number = target.value;
    if (target instanceof HTMLInputElement && target.type === "number")
      value = Number(target.value);
    setFormData((p) => ({ ...p, [name]: value } as TrainingFormData));
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
              {initialData ? "Edit Training" : "Schedule Training"}
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

            <div>
              <label className="block text-sm font-medium text-[#0A1931] mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Training title"
                className={`w-full px-4 py-3 border rounded-xl ${
                  errors.title ? "border-red-500" : "border-[#B3CFE5]"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
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
                placeholder="Describe the training"
                className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start_date"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="start_date"
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl ${
                    errors.start_date ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                />
              </div>
              <div>
                <label
                  htmlFor="end_date"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="end_date"
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl ${
                    errors.end_date ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  Location
                </label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location or online"
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                />
              </div>
              <div>
                <label
                  htmlFor="capacity"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Capacity
                </label>
                <input
                  id="capacity"
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min={0}
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="cost_per_person"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Cost per person
                </label>
                <input
                  id="cost_per_person"
                  type="number"
                  name="cost_per_person"
                  value={formData.cost_per_person}
                  onChange={handleChange}
                  min={0}
                  step="0.01"
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                />
              </div>
              <div>
                <label
                  htmlFor="training_status"
                  className="block text-sm font-medium text-[#0A1931] mb-2"
                >
                  Status
                </label>
                <select
                  id="training_status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl border-[#B3CFE5]"
                >
                  <option value="planned">Planned</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
                {isSubmitting
                  ? "Saving..."
                  : initialData
                  ? "Save Changes"
                  : "Create Training"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
