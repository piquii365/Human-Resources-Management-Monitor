import { useEffect, useState } from "react";
import type { Employee, Department } from "../lib/types";
import { fetchEmployees, fetchDepartments } from "../api";
import { Plus, Search, Edit, Trash2, Mail, Phone } from "lucide-react";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        fetchEmployees(),
        fetchDepartments(),
      ]);

      if (employeesRes && employeesRes.data)
        setEmployees(employeesRes.data as Employee[]);
      if (departmentsRes && departmentsRes.data)
        setDepartments(departmentsRes.data as Department[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (departmentId: string | null) => {
    if (!departmentId) return "N/A";
    return departments.find((d) => d.id === departmentId)?.name || "Unknown";
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || emp.employment_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      on_leave: "bg-yellow-100 text-yellow-800",
    };
    return styles[status as keyof typeof styles] || styles.active;
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
          <h1 className="text-3xl font-bold text-[#0A1931]">Employees</h1>
          <p className="text-gray-600 mt-1">
            Manage employee records and information
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white rounded-xl hover:shadow-lg transition-all">
          <Plus size={20} />
          Add Employee
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
              placeholder="Search employees..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#B3CFE5]">
                <th className="text-left py-4 px-4 text-sm font-semibold text-[#0A1931]">
                  Employee #
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-[#0A1931]">
                  Name
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-[#0A1931]">
                  Position
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-[#0A1931]">
                  Department
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-[#0A1931]">
                  Contact
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-[#0A1931]">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-[#0A1931]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-[#B3CFE5]/30 hover:bg-[#F6FAFD] transition-colors"
                >
                  <td className="py-4 px-4 text-sm text-gray-700">
                    {employee.employee_number}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-[#0A1931]">
                      {employee.first_name} {employee.last_name}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">
                    {employee.position}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">
                    {getDepartmentName(employee.department_id)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Mail size={12} />
                        <span className="truncate max-w-[150px]">
                          {employee.email}
                        </span>
                      </div>
                      {employee.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone size={12} />
                          <span>{employee.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        employee.employment_status
                      )}`}
                    >
                      {employee.employment_status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        title="Edit Employee"
                        className="p-2 text-[#4A7FA7] hover:bg-[#B3CFE5]/30 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        title="Delete Employee"
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No employees found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
