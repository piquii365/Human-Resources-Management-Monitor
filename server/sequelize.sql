-- sequelize.sql
-- Database schema, views, functions and stored procedures for HR-MES
-- Generated from client types and server usage (MySQL dialect)

-- NOTE: Run this file on a MySQL server. Adjust character sets, engine, or types as needed.

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Schema creation
-- ----------------------------

CREATE TABLE IF NOT EXISTS departments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(64) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  head_employee_id CHAR(36) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_departments_code (code),
  CONSTRAINT fk_departments_head_employee FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Employees table depends on departments, create with deferred FK (we added FK above referencing employees - to avoid cycle we'll drop and re-add after table create)

CREATE TABLE IF NOT EXISTS employees (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) DEFAULT NULL,
  employee_number VARCHAR(64) DEFAULT NULL,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  department_id CHAR(36) DEFAULT NULL,
  position VARCHAR(255) DEFAULT NULL,
  hire_date DATE DEFAULT NULL,
  employment_status ENUM('active','inactive','on_leave') DEFAULT 'active',
  salary DECIMAL(12,2) DEFAULT NULL,
  photo_url VARCHAR(1024) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employees_email (email),
  INDEX idx_employees_department (department_id),
  CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Now that employees table exists, ensure departments.head_employee_id FK is present (if not, add it)
ALTER TABLE departments
  ADD CONSTRAINT IF NOT EXISTS fk_departments_head_employee FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Performance evaluations
CREATE TABLE IF NOT EXISTS performance_evaluations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  evaluator_id CHAR(36) DEFAULT NULL,
  evaluation_period VARCHAR(100) DEFAULT NULL,
  evaluation_date DATE DEFAULT NULL,
  performance_score DECIMAL(5,2) DEFAULT NULL,
  technical_skills TINYINT UNSIGNED DEFAULT NULL,
  communication TINYINT UNSIGNED DEFAULT NULL,
  teamwork TINYINT UNSIGNED DEFAULT NULL,
  leadership TINYINT UNSIGNED DEFAULT NULL,
  punctuality TINYINT UNSIGNED DEFAULT NULL,
  comments TEXT DEFAULT NULL,
  goals_met TINYINT(1) DEFAULT 0,
  status ENUM('draft','submitted','approved') DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_eval_employee (employee_id),
  CONSTRAINT fk_eval_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recruitment (job postings)
CREATE TABLE IF NOT EXISTS recruitment (
  id CHAR(36) NOT NULL PRIMARY KEY,
  job_title VARCHAR(255) NOT NULL,
  department_id CHAR(36) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  requirements TEXT DEFAULT NULL,
  position_type ENUM('full_time','part_time','contract') DEFAULT 'full_time',
  salary_range VARCHAR(128) DEFAULT NULL,
  posting_date DATE DEFAULT NULL,
  closing_date DATE DEFAULT NULL,
  status ENUM('open','closed','filled') DEFAULT 'open',
  vacancies INT DEFAULT 1,
  created_by CHAR(36) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_recruitment_dept (department_id),
  CONSTRAINT fk_recruitment_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Applications for recruitments
CREATE TABLE IF NOT EXISTS applications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  recruitment_id CHAR(36) NOT NULL,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255) DEFAULT NULL,
  applicant_phone VARCHAR(50) DEFAULT NULL,
  resume_url VARCHAR(1024) DEFAULT NULL,
  cover_letter TEXT DEFAULT NULL,
  application_date DATE DEFAULT NULL,
  status ENUM('pending','reviewed','shortlisted','rejected','hired') DEFAULT 'pending',
  interview_date DATETIME DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_app_recruitment (recruitment_id),
  CONSTRAINT fk_app_recruitment FOREIGN KEY (recruitment_id) REFERENCES recruitment(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Training programs
CREATE TABLE IF NOT EXISTS training_programs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  trainer VARCHAR(255) DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  capacity INT DEFAULT NULL,
  cost_per_person DECIMAL(10,2) DEFAULT NULL,
  status ENUM('planned','ongoing','completed','cancelled') DEFAULT 'planned',
  created_by CHAR(36) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Training enrollments
CREATE TABLE IF NOT EXISTS training_enrollments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  training_program_id CHAR(36) NOT NULL,
  employee_id CHAR(36) NOT NULL,
  enrollment_date DATE DEFAULT NULL,
  attendance_status ENUM('registered','attended','absent','completed') DEFAULT 'registered',
  completion_date DATE DEFAULT NULL,
  certificate_issued TINYINT(1) DEFAULT 0,
  feedback TEXT DEFAULT NULL,
  rating TINYINT UNSIGNED DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_enroll_program (training_program_id),
  INDEX idx_enroll_employee (employee_id),
  CONSTRAINT fk_enroll_program FOREIGN KEY (training_program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
  CONSTRAINT fk_enroll_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------
-- Views
-- ----------------------------

DROP VIEW IF EXISTS view_employees_by_department;
CREATE VIEW view_employees_by_department AS
SELECT
  e.id AS employee_id,
  e.employee_number,
  e.first_name,
  e.last_name,
  e.email,
  e.phone,
  e.position,
  e.hire_date,
  e.employment_status,
  e.salary,
  e.department_id,
  d.name AS department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;

DROP VIEW IF EXISTS view_open_recruitments;
CREATE VIEW view_open_recruitments AS
SELECT r.id, r.job_title, r.department_id, d.name AS department_name, r.posting_date, r.closing_date, r.status, r.vacancies
FROM recruitment r
LEFT JOIN departments d ON r.department_id = d.id
WHERE r.status = 'open';

DROP VIEW IF EXISTS view_top_performers;
CREATE VIEW view_top_performers AS
SELECT
  pe.employee_id,
  AVG(pe.performance_score) AS avg_score,
  COUNT(pe.id) AS evaluations_count
FROM performance_evaluations pe
GROUP BY pe.employee_id
HAVING AVG(pe.performance_score) >= 85
ORDER BY avg_score DESC;

-- ----------------------------
-- Functions
-- ----------------------------

DROP FUNCTION IF EXISTS fn_employee_full_name;
DELIMITER $$
CREATE FUNCTION fn_employee_full_name(emp_id CHAR(36))
RETURNS VARCHAR(255)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE fullName VARCHAR(255);
  SELECT CONCAT(first_name, ' ', last_name) INTO fullName FROM employees WHERE id = emp_id LIMIT 1;
  RETURN fullName;
END$$
DELIMITER ;

DROP FUNCTION IF EXISTS fn_employee_avg_performance;
DELIMITER $$
CREATE FUNCTION fn_employee_avg_performance(emp_id CHAR(36))
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE avgScore DECIMAL(5,2);
  SELECT IFNULL(AVG(performance_score), 0) INTO avgScore FROM performance_evaluations WHERE employee_id = emp_id;
  RETURN avgScore;
END$$
DELIMITER ;

-- ----------------------------
-- Stored procedures
-- ----------------------------

-- Insert a new employee (id can be provided or UUID() used by the caller)
DROP PROCEDURE IF EXISTS sp_insert_employee;
DELIMITER $$
CREATE PROCEDURE sp_insert_employee(
  IN p_id CHAR(36),
  IN p_user_id CHAR(36),
  IN p_employee_number VARCHAR(64),
  IN p_first_name VARCHAR(128),
  IN p_last_name VARCHAR(128),
  IN p_email VARCHAR(255),
  IN p_phone VARCHAR(50),
  IN p_department_id CHAR(36),
  IN p_position VARCHAR(255),
  IN p_hire_date DATE,
  IN p_employment_status ENUM('active','inactive','on_leave'),
  IN p_salary DECIMAL(12,2),
  IN p_photo_url VARCHAR(1024)
)
BEGIN
  INSERT INTO employees(id, user_id, employee_number, first_name, last_name, email, phone, department_id, position, hire_date, employment_status, salary, photo_url)
  VALUES (
    COALESCE(p_id, UUID()),
    p_user_id,
    p_employee_number,
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_department_id,
    p_position,
    p_hire_date,
    p_employment_status,
    p_salary,
    p_photo_url
  );
END$$
DELIMITER ;

-- Add an application for a recruitment
DROP PROCEDURE IF EXISTS sp_add_application;
DELIMITER $$
CREATE PROCEDURE sp_add_application(
  IN p_id CHAR(36),
  IN p_recruitment_id CHAR(36),
  IN p_applicant_name VARCHAR(255),
  IN p_applicant_email VARCHAR(255),
  IN p_applicant_phone VARCHAR(50),
  IN p_resume_url VARCHAR(1024),
  IN p_cover_letter TEXT,
  IN p_application_date DATE
)
BEGIN
  INSERT INTO applications(id, recruitment_id, applicant_name, applicant_email, applicant_phone, resume_url, cover_letter, application_date)
  VALUES (COALESCE(p_id, UUID()), p_recruitment_id, p_applicant_name, p_applicant_email, p_applicant_phone, p_resume_url, p_cover_letter, p_application_date);
END$$
DELIMITER ;

-- Create performance evaluation
DROP PROCEDURE IF EXISTS sp_create_evaluation;
DELIMITER $$
CREATE PROCEDURE sp_create_evaluation(
  IN p_id CHAR(36),
  IN p_employee_id CHAR(36),
  IN p_evaluator_id CHAR(36),
  IN p_evaluation_period VARCHAR(100),
  IN p_evaluation_date DATE,
  IN p_performance_score DECIMAL(5,2),
  IN p_technical_skills TINYINT UNSIGNED,
  IN p_communication TINYINT UNSIGNED,
  IN p_teamwork TINYINT UNSIGNED,
  IN p_leadership TINYINT UNSIGNED,
  IN p_punctuality TINYINT UNSIGNED,
  IN p_comments TEXT,
  IN p_goals_met TINYINT(1),
  IN p_status ENUM('draft','submitted','approved')
)
BEGIN
  INSERT INTO performance_evaluations(id, employee_id, evaluator_id, evaluation_period, evaluation_date, performance_score, technical_skills, communication, teamwork, leadership, punctuality, comments, goals_met, status)
  VALUES (COALESCE(p_id, UUID()), p_employee_id, p_evaluator_id, p_evaluation_period, p_evaluation_date, p_performance_score, p_technical_skills, p_communication, p_teamwork, p_leadership, p_punctuality, p_comments, p_goals_met, p_status);
END$$
DELIMITER ;

-- Hire an applicant: mark application as hired and (optionally) create an employee record using applicant data
DROP PROCEDURE IF EXISTS sp_hire_applicant;
DELIMITER $$
CREATE PROCEDURE sp_hire_applicant(
  IN p_application_id CHAR(36),
  IN p_new_employee_id CHAR(36)
)
BEGIN
  DECLARE app_recruitment CHAR(36);
  DECLARE applicant_name VARCHAR(255);
  DECLARE applicant_email VARCHAR(255);
  DECLARE applicant_phone VARCHAR(50);
  DECLARE first_name VARCHAR(128);
  DECLARE last_name VARCHAR(128);

  SELECT recruitment_id, applicant_name, applicant_email, applicant_phone INTO app_recruitment, applicant_name, applicant_email, applicant_phone
  FROM applications WHERE id = p_application_id LIMIT 1;

  -- split name into first and last (best-effort)
  SET first_name = TRIM(SUBSTRING_INDEX(applicant_name, ' ', 1));
  SET last_name = TRIM(SUBSTRING_INDEX(applicant_name, ' ', -1));

  -- Insert a new employee based on applicant info (some fields left null)
  INSERT INTO employees(id, first_name, last_name, email, phone, created_at)
  VALUES (COALESCE(p_new_employee_id, UUID()), first_name, last_name, applicant_email, applicant_phone, NOW());

  -- Mark application as hired
  UPDATE applications SET status = 'hired', updated_at = NOW() WHERE id = p_application_id;

  -- Optionally, you may want to change recruitment vacancies/status; that's left to application logic
END$$
DELIMITER ;

-- ----------------------------
-- Helpful maintenance procedures
-- ----------------------------

-- Archive old evaluations older than a given date (example)
DROP PROCEDURE IF EXISTS sp_archive_evaluations_older_than;
DELIMITER $$
CREATE PROCEDURE sp_archive_evaluations_older_than(IN cutoff_date DATE)
BEGIN
  -- This implementation simply deletes; in production, you'd move rows to an archive table
  DELETE FROM performance_evaluations WHERE evaluation_date < cutoff_date;
END$$
DELIMITER ;

-- ----------------------------
-- End of sequelize.sql
-- ----------------------------
