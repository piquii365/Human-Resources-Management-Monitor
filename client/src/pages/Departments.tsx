import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  fetchMinEmployees,
} from "../api";
import type { Department } from "../lib/types";

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [headEmployeeId, setHeadEmployeeId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<
    Array<{ id: string; displayName: string }>
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const normalize = (r: unknown) => {
    if (Array.isArray(r)) return r;
    if (r && typeof r === "object") {
      const maybe = r as unknown as { data?: unknown };
      if (Array.isArray(maybe.data)) return maybe.data as unknown[];
    }
    return [] as unknown[];
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDepartments();
      setDepartments(normalize(res) as Department[]);
      // load minimal employees for head select
      try {
        const empRes = await fetchMinEmployees();
        const list = normalize(empRes) as unknown[];
        const mapped = list.map((row) => {
          const r = row as Record<string, unknown>;
          const id = typeof r.id === "string" ? r.id : String(r.id ?? "");
          const displayName =
            typeof r.full_name === "string"
              ? r.full_name
              : typeof r.first_name === "string" &&
                typeof r.last_name === "string"
              ? `${r.first_name} ${r.last_name}`
              : typeof r.employee_number === "string"
              ? r.employee_number
              : id;
          return { id, displayName };
        });
        setEmployees(mapped);
      } catch {
        // ignore employee load errors
        setEmployees([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getHeadName = (id: string) => {
    const e = employees.find((x) => x.id === id);
    return e ? e.displayName : "";
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setSelected(null);
    setName("");
    setCode("");
    setDescription("");
    setHeadEmployeeId(null);
    setIsModalOpen(true);
  };
  const openEdit = (d: Department) => {
    setSelected(d);
    setName(d.name);
    setCode(d.code || "");
    setDescription(d.description || "");
    setHeadEmployeeId(d.head_employee_id || null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name,
        code,
        description,
        head_employee_id: headEmployeeId,
      };
      if (selected) {
        await updateDepartment(selected.id, payload);
        setToast({ type: "success", message: "Department updated" });
      } else {
        await createDepartment(payload);
        setToast({ type: "success", message: "Department created" });
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
          ? ((err as { message?: unknown }).message as string)
          : "Failed to save department";
      setToast({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete department?")) return;
    try {
      await deleteDepartment(id);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1931]"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1931]">Departments</h1>
          <p className="text-gray-600 mt-1">Manage departments</p>
        </div>
        <div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white rounded-xl"
          >
            <Plus size={18} /> Add Department
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50">
        <div className="grid gap-4">
          {departments.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between border-b py-3"
            >
              <div>
                <div className="font-medium text-[#0A1931]">{d.name}</div>
                <div className="text-xs text-gray-500">
                  {d.code || ""}{" "}
                  {d.head_employee_id
                    ? `· Head: ${getHeadName(d.head_employee_id)}`
                    : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="edit"
                  className="p-2 text-[#4A7FA7] hover:bg-[#B3CFE5]/30 rounded-lg"
                  onClick={() => openEdit(d)}
                >
                  <Edit size={16} />
                </button>
                <button
                  aria-label="delete"
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  onClick={() => handleDelete(d.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selected ? "Edit Department" : "New Department"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  placeholder="Department name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1931] mb-1">
                  Code
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  placeholder="Dept code (e.g. FIN, HR)"
                />
              </div>

              <div>
                <label
                  htmlFor="dept_description"
                  className="block text-sm font-medium text-[#0A1931] mb-1"
                >
                  Description
                </label>
                <textarea
                  id="dept_description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label
                  htmlFor="dept_head"
                  className="block text-sm font-medium text-[#0A1931] mb-1"
                >
                  Head
                </label>
                <select
                  id="dept_head"
                  value={headEmployeeId ?? ""}
                  onChange={(e) => setHeadEmployeeId(e.target.value || null)}
                  className="w-full px-4 py-3 border rounded-xl"
                >
                  <option value="">— Select head —</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 rounded-xl border"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white disabled:opacity-50"
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
              >
                {isSaving ? "Saving..." : "Save"}
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
    </div>
  );
}
