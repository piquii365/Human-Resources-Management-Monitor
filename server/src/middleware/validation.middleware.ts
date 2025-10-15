import { body, validationResult } from "express-validator";
import express from "express";

// Validation middleware to handle validation errors
export const handleValidationErrors = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.type === "field" ? error.path : "unknown",
        message: error.msg,
      })),
    });
  }
  next();
};

// Input sanitization helper
export const sanitizeInput = (input: string | undefined | null): string => {
  return (input || "").trim().replace(/[<>]/g, "");
};

// Login validation rules remain the same
export const validateLogin = [
  body("user")
    .notEmpty()
    .withMessage("Please provide a username or email address!")
    .customSanitizer(sanitizeInput),

  body("password")
    .notEmpty()
    .withMessage("Please provide a password!")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long!")
    .customSanitizer(sanitizeInput),
];
// Registration validation rules

export const validateRegistration = [
  body("name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces")
    .customSanitizer(sanitizeInput),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .customSanitizer(sanitizeInput),

  body("uid")
    .isLength({ min: 2, max: 50 })
    .withMessage("Username must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .customSanitizer(sanitizeInput),

  body("displayPicture")
    .isURL()
    .withMessage("Please provide a valid URL for the display picture")
    .customSanitizer(sanitizeInput),
];

// Contact form validation rules
export const validateContact = [
  body("name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .customSanitizer(sanitizeInput),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .customSanitizer(sanitizeInput),

  body("subject")
    .isLength({ min: 5, max: 100 })
    .withMessage("Subject must be between 5 and 100 characters")
    .customSanitizer(sanitizeInput),

  body("message")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Message must be between 10 and 1000 characters")
    .customSanitizer(sanitizeInput),

  body("category")
    .isIn(["general", "support", "billing", "partnership", "feedback"])
    .withMessage("Invalid category"),
];

// Profile update validation rules
export const validateProfileUpdate = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .customSanitizer(sanitizeInput),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .customSanitizer(sanitizeInput),

  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number")
    .customSanitizer(sanitizeInput),

  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters")
    .customSanitizer(sanitizeInput),

  body("location")
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage("Location must be between 3 and 100 characters")
    .customSanitizer(sanitizeInput),
];

// Password change validation rules
export const validatePasswordChange = [
  body("currentPassword")
    .isLength({ min: 6 })
    .withMessage("Current password is required")
    .customSanitizer(sanitizeInput),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    )
    .customSanitizer(sanitizeInput),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

// ----------------------------
// DB-based validation rules
// ----------------------------

export const validateDepartment = [
  body("name")
    .notEmpty()
    .withMessage("Department name is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Department name must be between 2 and 255 characters")
    .customSanitizer(sanitizeInput),

  body("code")
    .optional({ nullable: true })
    .isLength({ max: 64 })
    .withMessage("Code must not exceed 64 characters")
    .matches(/^[A-Za-z0-9_\-]*$/)
    .withMessage(
      "Code can only contain letters, numbers, underscores and dashes"
    )
    .customSanitizer(sanitizeInput),

  body("description")
    .optional({ nullable: true })
    .isLength({ max: 2000 })
    .withMessage("Description is too long")
    .customSanitizer(sanitizeInput),

  body("head_employee_id")
    .optional({ nullable: true })
    .isUUID(4)
    .withMessage("Invalid head_employee_id format"),
];

export const validateEmployee = [
  body("first_name")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 1, max: 128 })
    .withMessage("First name must be between 1 and 128 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("First name contains invalid characters")
    .customSanitizer(sanitizeInput),

  body("last_name")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 1, max: 128 })
    .withMessage("Last name must be between 1 and 128 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Last name contains invalid characters")
    .customSanitizer(sanitizeInput),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .customSanitizer(sanitizeInput),

  body("phone")
    .optional({ nullable: true })
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number")
    .customSanitizer(sanitizeInput),

  body("employee_number")
    .optional({ nullable: true })
    .isLength({ max: 64 })
    .withMessage("Employee number must not exceed 64 characters")
    .matches(/^[A-Za-z0-9_-]*$/)
    .withMessage("Employee number contains invalid characters")
    .customSanitizer(sanitizeInput),

  body("department_id")
    .optional({ nullable: true })
    .isUUID(4)
    .withMessage("Invalid department_id"),

  body("position")
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .withMessage("Position must not exceed 255 characters")
    .customSanitizer(sanitizeInput),

  body("hire_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("hire_date must be a valid date"),

  body("employment_status")
    .optional({ nullable: true })
    .isIn(["active", "inactive", "on_leave"])
    .withMessage("Invalid employment status"),

  body("salary")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Salary must be a positive number")
    .toFloat(),

  body("photo_url")
    .optional({ nullable: true })
    .isURL()
    .withMessage("photo_url must be a valid URL")
    .customSanitizer(sanitizeInput),

  body("user_id")
    .optional({ nullable: true })
    .isUUID(4)
    .withMessage("Invalid user_id"),
];

export const validatePerformanceEvaluation = [
  body("employee_id")
    .notEmpty()
    .withMessage("employee_id is required")
    .isUUID(4)
    .withMessage("Invalid employee_id"),

  body("evaluator_id")
    .optional({ nullable: true })
    .isUUID(4)
    .withMessage("Invalid evaluator_id"),

  body("evaluation_period")
    .optional({ nullable: true })
    .isLength({ max: 100 })
    .withMessage("evaluation_period must not exceed 100 characters")
    .customSanitizer(sanitizeInput),

  body("evaluation_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("evaluation_date must be a valid date"),

  body("performance_score")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage("performance_score must be between 0 and 100")
    .toFloat(),

  body("technical_skills")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .toInt(),
  body("communication")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .toInt(),
  body("teamwork")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .toInt(),
  body("leadership")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .toInt(),
  body("punctuality")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .toInt(),

  body("comments")
    .optional({ nullable: true })
    .isLength({ max: 2000 })
    .withMessage("Comments too long")
    .customSanitizer(sanitizeInput),

  body("goals_met")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("goals_met must be boolean")
    .toBoolean(),

  body("status")
    .optional({ nullable: true })
    .isIn(["draft", "submitted", "approved"])
    .withMessage("Invalid status for evaluation"),
];

export const validateRecruitment = [
  body("job_title")
    .notEmpty()
    .withMessage("Job title is required")
    .isLength({ max: 255 })
    .withMessage("Job title must not exceed 255 characters")
    .customSanitizer(sanitizeInput),

  body("department_id")
    .optional({ nullable: true })
    .isUUID(4)
    .withMessage("Invalid department_id"),

  body("description")
    .optional({ nullable: true })
    .isLength({ max: 2000 })
    .customSanitizer(sanitizeInput),
  body("requirements")
    .optional({ nullable: true })
    .isLength({ max: 2000 })
    .customSanitizer(sanitizeInput),

  body("position_type")
    .optional({ nullable: true })
    .isIn(["full_time", "part_time", "contract"])
    .withMessage("Invalid position_type"),

  body("salary_range")
    .optional({ nullable: true })
    .isLength({ max: 128 })
    .customSanitizer(sanitizeInput),

  body("posting_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("posting_date must be a valid date"),
  body("closing_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("closing_date must be a valid date"),

  body("status")
    .optional({ nullable: true })
    .isIn(["open", "closed", "filled"])
    .withMessage("Invalid status"),

  body("vacancies").optional({ nullable: true }).isInt({ min: 0 }).toInt(),

  body("created_by")
    .optional({ nullable: true })
    .isUUID(4)
    .withMessage("Invalid created_by id"),
];

export const validateApplication = [
  body("recruitment_id")
    .notEmpty()
    .withMessage("recruitment_id is required")
    .isUUID(4)
    .withMessage("Invalid recruitment_id"),

  body("applicant_name")
    .notEmpty()
    .withMessage("Applicant name is required")
    .isLength({ max: 255 })
    .withMessage("Applicant name must not exceed 255 characters")
    .customSanitizer(sanitizeInput),

  body("applicant_email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("applicant_phone")
    .optional({ nullable: true })
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),

  body("resume_url")
    .optional({ nullable: true })
    .isURL()
    .withMessage("resume_url must be a valid URL"),
  body("cover_letter")
    .optional({ nullable: true })
    .isLength({ max: 2000 })
    .customSanitizer(sanitizeInput),

  body("application_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("application_date must be a valid date"),

  body("status")
    .optional({ nullable: true })
    .isIn(["pending", "reviewed", "shortlisted", "rejected", "hired"])
    .withMessage("Invalid application status"),

  body("interview_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("interview_date must be a valid date"),
  body("notes")
    .optional({ nullable: true })
    .isLength({ max: 2000 })
    .customSanitizer(sanitizeInput),
];

export const validateTrainingProgram = [
  body("title")
    .notEmpty()
    .withMessage("Training title is required")
    .isLength({ max: 255 })
    .withMessage("Title must not exceed 255 characters")
    .customSanitizer(sanitizeInput),

  body("description")
    .optional({ nullable: true })
    .isLength({ max: 2000 })
    .customSanitizer(sanitizeInput),
  body("trainer")
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .customSanitizer(sanitizeInput),

  body("start_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("start_date must be a valid date"),
  body("end_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("end_date must be a valid date"),

  body("location")
    .optional({ nullable: true })
    .isLength({ max: 255 })
    .customSanitizer(sanitizeInput),
  body("capacity").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("cost_per_person")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .toFloat(),

  body("status")
    .optional({ nullable: true })
    .isIn(["planned", "ongoing", "completed", "cancelled"])
    .withMessage("Invalid training status"),

  body("created_by")
    .optional({ nullable: true })
    .isUUID(4)
    .withMessage("Invalid created_by id"),
];

export const validateTrainingEnrollment = [
  body("training_program_id")
    .notEmpty()
    .withMessage("training_program_id is required")
    .isUUID(4)
    .withMessage("Invalid training_program_id"),

  body("employee_id")
    .notEmpty()
    .withMessage("employee_id is required")
    .isUUID(4)
    .withMessage("Invalid employee_id"),

  body("enrollment_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("enrollment_date must be a valid date"),

  body("attendance_status")
    .optional({ nullable: true })
    .isIn(["registered", "attended", "absent", "completed"])
    .withMessage("Invalid attendance status"),

  body("completion_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("completion_date must be a valid date"),
  body("certificate_issued")
    .optional({ nullable: true })
    .isBoolean()
    .toBoolean(),
  body("feedback")
    .optional({ nullable: true })
    .isLength({ max: 2000 })
    .customSanitizer(sanitizeInput),
  body("rating").optional({ nullable: true }).isInt({ min: 0, max: 5 }).toInt(),
];
