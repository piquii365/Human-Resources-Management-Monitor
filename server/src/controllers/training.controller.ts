import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const listTrainingPrograms = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const { status, trainer, year, limit, offset } = req.query;
    const params = [
      (status as string) || null,
      (trainer as string) || null,
      year ? Number(year) : null,
      limit ? Number(limit) : null,
      offset ? Number(offset) : null,
    ];
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_training_programs(?,?,?,?,?)",
      params
    );
    res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const getTraining = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    // fetch single program with enrollment count
    const [rows]: [any[], any] = await connection.query(
      `SELECT tp.*, CONCAT(e.first_name,' ',e.last_name) AS created_by_name,
        COUNT(te.id) AS enrollment_count
       FROM training_programs tp
       LEFT JOIN employees e ON tp.created_by = e.id
       LEFT JOIN training_enrollments te ON tp.id = te.training_program_id
       WHERE tp.id = ?
       GROUP BY tp.id, tp.title, tp.description, tp.trainer, tp.start_date, tp.end_date,
         tp.location, tp.capacity, tp.cost_per_person, tp.status, tp.created_by, tp.created_at, tp.updated_at, e.first_name, e.last_name`,
      [id]
    );
    res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const listEnrollments = async (
  req: express.Request,
  res: express.Response
) => {
  const { programId } = req.params;
  const connection = await conn.getConnection();
  try {
    if (programId) {
      const [rows]: [any[], any] = await connection.query(
        `SELECT te.*, e.first_name, e.last_name, tp.title AS training_title
         FROM training_enrollments te
         LEFT JOIN employees e ON te.employee_id = e.id
         LEFT JOIN training_programs tp ON te.training_program_id = tp.id
         WHERE te.training_program_id = ?
         ORDER BY te.created_at DESC`,
        [programId]
      );
      res.json({ success: true, data: rows || [] });
    } else {
      // return recent enrollments across programs
      const [rows]: [any[], any] = await connection.query(
        `SELECT te.*, e.first_name, e.last_name, tp.title AS training_title
         FROM training_enrollments te
         LEFT JOIN employees e ON te.employee_id = e.id
         LEFT JOIN training_programs tp ON te.training_program_id = tp.id
         ORDER BY te.created_at DESC LIMIT 200`
      );
      res.json({ success: true, data: rows || [] });
    }
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const createTraining = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const {
      id,
      title,
      description,
      trainer,
      start_date,
      end_date,
      location,
      capacity,
      cost_per_person,
      status,
      created_by,
    } = req.body as Record<string, any>;

    await connection.query(
      "CALL sp_create_training_program(?,?,?,?,?,?,?,?,?,?,?)",
      [
        id || null,
        title,
        description || null,
        trainer || null,
        start_date || null,
        end_date || null,
        location || null,
        capacity ?? null,
        cost_per_person ?? null,
        status || null,
        created_by || null,
      ]
    );
    res.json({ success: true, message: "Training created" });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const updateTraining = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    const {
      title,
      description,
      trainer,
      start_date,
      end_date,
      location,
      capacity,
      cost_per_person,
      status,
    } = req.body as Record<string, any>;

    await connection.query(
      "CALL sp_update_training_program(?,?,?,?,?,?,?,?,?,?)",
      [
        id,
        title || null,
        description || null,
        trainer || null,
        start_date || null,
        end_date || null,
        location || null,
        capacity ?? null,
        cost_per_person ?? null,
        status || null,
      ]
    );
    res.json({ success: true, message: "Training updated" });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const deleteTraining = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_delete_training_program(?)", [id]);
    res.json({ success: true, message: "Training deleted" });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

// Enrollments
export const createEnrollment = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const {
      id,
      training_program_id,
      employee_id,
      enrollment_date,
      attendance_status,
      completion_date,
      certificate_issued,
      feedback,
      rating,
    } = req.body as Record<string, any>;

    await connection.query(
      "CALL sp_create_training_enrollment(?,?,?,?,?,?,?,?,?)",
      [
        id || null,
        training_program_id,
        employee_id,
        enrollment_date || null,
        attendance_status || null,
        completion_date || null,
        certificate_issued ? 1 : 0,
        feedback || null,
        rating ?? null,
      ]
    );
    res.json({ success: true, message: "Enrollment created" });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const updateEnrollment = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    const {
      attendance_status,
      completion_date,
      certificate_issued,
      feedback,
      rating,
    } = req.body as Record<string, any>;
    await connection.query("CALL sp_update_training_enrollment(?,?,?,?,?,?)", [
      id,
      attendance_status || null,
      completion_date || null,
      certificate_issued ? 1 : 0,
      feedback || null,
      rating ?? null,
    ]);
    res.json({ success: true, message: "Enrollment updated" });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const deleteEnrollment = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_delete_training_enrollment(?)", [id]);
    res.json({ success: true, message: "Enrollment deleted" });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};
