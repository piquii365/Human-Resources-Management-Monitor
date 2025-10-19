import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Department } from "../lib/types";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  departments: Department[];
  initialData?: Partial<EmployeeFormData> | null;
}

export interface EmployeeFormData {
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: string;
  position: string;
  hire_date: string;
  employment_status: "active" | "inactive" | "on_leave";
  salary: string;
}

const initialFormData: EmployeeFormData = {
  employee_number: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  department_id: "",
  position: "",
  hire_date: "",
  employment_status: "active",
  salary: "",
};

export default function EmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  departments,
  initialData = null,
}: EmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EmployeeFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setIsSubmitting(false);
      setServerError("");
    } else if (initialData) {
      // populate form when editing
      setFormData((prev) => ({ ...prev, ...initialData } as EmployeeFormData));
    }
    // autofocus first input when modal opens
    if (isOpen) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialData]);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.employee_number.trim()) {
      newErrors.employee_number = "Employee number is required";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.department_id) {
      newErrors.department_id = "Department is required";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }

    if (!formData.hire_date) {
      newErrors.hire_date = "Hire date is required";
    }

    if (!formData.salary.trim()) {
      newErrors.salary = "Salary is required";
    } else if (isNaN(Number(formData.salary)) || Number(formData.salary) < 0) {
      newErrors.salary = "Please enter a valid salary amount";
    }

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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    try {
      console.log(formData);
      await onSubmit(formData);
      onClose();
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      // Safely extract field errors if present
      if (typeof error === "object" && error !== null) {
        const maybe = error as { data?: unknown };
        const data = maybe.data;
        if (data && typeof data === "object") {
          const d = data as { errors?: unknown };
          if (Array.isArray(d.errors)) {
            const newErrors: Partial<Record<keyof EmployeeFormData, string>> =
              {};
            for (const item of d.errors as Array<unknown>) {
              if (typeof item === "object" && item !== null) {
                const it = item as { field?: unknown; message?: unknown };
                if (
                  typeof it.field === "string" &&
                  typeof it.message === "string"
                ) {
                  newErrors[it.field as keyof EmployeeFormData] = it.message;
                }
              }
            }
            setErrors(newErrors);
          }
        }
      }
      setServerError(
        getErrorMessage(error) || "Failed to add employee. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof EmployeeFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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
              {initialData ? "Edit Employee" : "Add New Employee"}
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
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  Employee Number <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  name="employee_number"
                  value={formData.employee_number}
                  onChange={handleChange}
                  aria-busy={isSubmitting ? true : undefined}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] ${
                    errors.employee_number
                      ? "border-red-500"
                      : "border-[#B3CFE5]"
                  }`}
                  placeholder="e.g., EMP001"
                />
                {errors.employee_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.employee_number}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  Employment Status <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="Employee Status"
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#B3CFE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] ${
                    errors.first_name ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] ${
                    errors.last_name ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] ${
                    errors.email ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] ${
                    errors.phone ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                  placeholder="+1234567890"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="Department"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] ${
                    errors.department_id ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.department_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.department_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] ${
                    errors.position ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                  placeholder="Software Engineer"
                />
                {errors.position && (
                  <p className="text-red-500 text-sm mt-1">{errors.position}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  Hire Date <span className="text-red-500">*</span>
                </label>
                <input
                  aria-label="Hire Date"
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] ${
                    errors.hire_date ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                />
                {errors.hire_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.hire_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-2">
                  Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A7FA7] ${
                    errors.salary ? "border-red-500" : "border-[#B3CFE5]"
                  }`}
                  placeholder="50000"
                  min="0"
                  step="0.01"
                />
                {errors.salary && (
                  <p className="text-red-500 text-sm mt-1">{errors.salary}</p>
                )}
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
                  ? initialData
                    ? "Saving..."
                    : "Adding..."
                  : initialData
                  ? "Save Changes"
                  : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
