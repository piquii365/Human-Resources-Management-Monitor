import axios, { type AxiosInstance } from "axios";
import type { User } from "./lib/types";

const BASE_URL = "http://localhost:3800/api";
export const PUBLIC_URL = "http://localhost:3800";

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const userString = sessionStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
      } catch (error) {
        console.error("Error parsing user data from sessionStorage:", error);
        // Optional: Clear invalid data
        sessionStorage.removeItem("user");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle HTTP errors
      const customError = {
        status: error.response.status,
        message: error.response.data?.message || "Request failed",
        data: error.response.data,
      };
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  }
);

export const register = async (user: User) => {
  try {
    return await apiClient.post("/auth/register", user);
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export default apiClient;

// Departments
export const fetchDepartments = async () => {
  try {
    return await apiClient.get("/departments");
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

export const fetchDepartment = async (id: string) => {
  try {
    return await apiClient.get(`/departments/${id}`);
  } catch (error) {
    console.error(`Error fetching department ${id}:`, error);
    throw error;
  }
};

export const createDepartment = async (payload: Record<string, unknown>) => {
  try {
    return await apiClient.post(`/departments`, payload);
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
};

export const updateDepartment = async (
  id: string,
  payload: Record<string, unknown>
) => {
  try {
    return await apiClient.put(`/departments/${id}`, payload);
  } catch (error) {
    console.error(`Error updating department ${id}:`, error);
    throw error;
  }
};

export const deleteDepartment = async (id: string) => {
  try {
    return await apiClient.delete(`/departments/${id}`);
  } catch (error) {
    console.error(`Error deleting department ${id}:`, error);
    throw error;
  }
};

// Employees
export const fetchEmployees = async () => {
  try {
    return await apiClient.get(`/employees`);
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const fetchEmployee = async (id: string) => {
  try {
    return await apiClient.get(`/employees/${id}`);
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
};

export const createEmployeeApi = async (payload: Record<string, unknown>) => {
  try {
    return await apiClient.post(`/employees`, payload);
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export const updateEmployeeApi = async (
  id: string,
  payload: Record<string, unknown>
) => {
  try {
    return await apiClient.put(`/employees/${id}`, payload);
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);
    throw error;
  }
};

export const deleteEmployeeApi = async (id: string) => {
  try {
    return await apiClient.delete(`/employees/${id}`);
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    throw error;
  }
};

// Recruitment & Applications
export const fetchRecruitments = async () => {
  try {
    return await apiClient.get(`/recruitment`);
  } catch (error) {
    console.error("Error fetching recruitments:", error);
    throw error;
  }
};

export const fetchRecruitment = async (id: string) => {
  try {
    return await apiClient.get(`/recruitment/${id}`);
  } catch (error) {
    console.error(`Error fetching recruitment ${id}:`, error);
    throw error;
  }
};

export const createRecruitmentApi = async (
  payload: Record<string, unknown>
) => {
  try {
    return await apiClient.post(`/recruitment`, payload);
  } catch (error) {
    console.error("Error creating recruitment:", error);
    throw error;
  }
};

export const updateRecruitmentApi = async (
  id: string,
  payload: Record<string, unknown>
) => {
  try {
    return await apiClient.put(`/recruitment/${id}`, payload);
  } catch (error) {
    console.error(`Error updating recruitment ${id}:`, error);
    throw error;
  }
};

export const deleteRecruitmentApi = async (id: string) => {
  try {
    return await apiClient.delete(`/recruitment/${id}`);
  } catch (error) {
    console.error(`Error deleting recruitment ${id}:`, error);
    throw error;
  }
};

export const fetchApplicationsForRecruitment = async (
  recruitmentId: string
) => {
  try {
    return await apiClient.get(`/recruitment/${recruitmentId}/applications`);
  } catch (error) {
    console.error(
      `Error fetching applications for recruitment ${recruitmentId}:`,
      error
    );
    throw error;
  }
};

export const fetchApplication = async (id: string) => {
  try {
    return await apiClient.get(`/applications/${id}`);
  } catch (error) {
    console.error(`Error fetching application ${id}:`, error);
    throw error;
  }
};

export const createApplicationApi = async (
  recruitmentId: string,
  payload: Record<string, unknown>
) => {
  try {
    return await apiClient.post(
      `/recruitment/${recruitmentId}/applications`,
      payload
    );
  } catch (error) {
    console.error(
      `Error creating application for recruitment ${recruitmentId}:`,
      error
    );
    throw error;
  }
};

export const updateApplicationStatusApi = async (
  id: string,
  payload: Record<string, unknown>
) => {
  try {
    return await apiClient.put(`/applications/${id}`, payload);
  } catch (error) {
    console.error(`Error updating application ${id}:`, error);
    throw error;
  }
};

// All Applications
export const fetchAllApplications = async () => {
  try {
    return await apiClient.get(`/applications`);
  } catch (error) {
    console.error("Error fetching all applications:", error);
    throw error;
  }
};

// Training
export const fetchTrainingPrograms = async () => {
  try {
    return await apiClient.get(`/training`);
  } catch (error) {
    console.error("Error fetching training programs:", error);
    throw error;
  }
};

export const fetchTraining = async (id: string) => {
  try {
    return await apiClient.get(`/training/${id}`);
  } catch (error) {
    console.error(`Error fetching training ${id}:`, error);
    throw error;
  }
};

export const fetchTrainingEnrollments = async (programId: string) => {
  try {
    return await apiClient.get(`/training/${programId}/enrollments`);
  } catch (error) {
    console.error(
      `Error fetching enrollments for program ${programId}:`,
      error
    );
    throw error;
  }
};

// Calendar
export const fetchCalendarEvents = async (from?: string, to?: string) => {
  try {
    return await apiClient.get(
      `/calendar/events${
        from || to ? `?from=${from || ""}&to=${to || ""}` : ""
      }`
    );
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
};

// Performance Evaluations
export const fetchEvaluations = async () => {
  try {
    return await apiClient.get(`/evaluations`);
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    throw error;
  }
};

export const fetchEvaluation = async (id: string) => {
  try {
    return await apiClient.get(`/evaluations/${id}`);
  } catch (error) {
    console.error(`Error fetching evaluation ${id}:`, error);
    throw error;
  }
};

export const createEvaluation = async (payload: Record<string, unknown>) => {
  try {
    return await apiClient.post(`/evaluations`, payload);
  } catch (error) {
    console.error("Error creating evaluation:", error);
    throw error;
  }
};

export const updateEvaluation = async (
  id: string,
  payload: Record<string, unknown>
) => {
  try {
    return await apiClient.put(`/evaluations/${id}`, payload);
  } catch (error) {
    console.error(`Error updating evaluation ${id}:`, error);
    throw error;
  }
};

export const deleteEvaluation = async (id: string) => {
  try {
    return await apiClient.delete(`/evaluations/${id}`);
  } catch (error) {
    console.error(`Error deleting evaluation ${id}:`, error);
    throw error;
  }
};
