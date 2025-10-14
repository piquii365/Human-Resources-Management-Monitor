export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  head_employee_id: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  user_id: string | null;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: string | null;
  position: string;
  hire_date: string;
  employment_status: "active" | "inactive" | "on_leave";
  salary: number;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceEvaluation {
  id: string;
  employee_id: string;
  evaluator_id: string;
  evaluation_period: string;
  evaluation_date: string;
  performance_score: number;
  technical_skills: number;
  communication: number;
  teamwork: number;
  leadership: number;
  punctuality: number;
  comments: string;
  goals_met: boolean;
  status: "draft" | "submitted" | "approved";
  created_at: string;
  updated_at: string;
}

export interface Recruitment {
  id: string;
  job_title: string;
  department_id: string;
  description: string;
  requirements: string;
  position_type: "full_time" | "part_time" | "contract";
  salary_range: string;
  posting_date: string;
  closing_date: string;
  status: "open" | "closed" | "filled";
  vacancies: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  recruitment_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  resume_url: string;
  cover_letter: string;
  application_date: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  interview_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  trainer: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  cost_per_person: number;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingEnrollment {
  id: string;
  training_program_id: string;
  employee_id: string;
  enrollment_date: string;
  attendance_status: "registered" | "attended" | "absent" | "completed";
  completion_date: string | null;
  certificate_issued: boolean;
  feedback: string;
  rating: number;
  created_at: string;
  updated_at: string;
}
