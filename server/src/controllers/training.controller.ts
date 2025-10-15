import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const listTrainingPrograms = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_training_programs()"
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
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_training_by_id(?)",
      [id]
    );
    res.json({
      success: true,
      data: rows[0] && rows[0][0] ? rows[0][0] : rows[0],
    });
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
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_enrollments_by_program(?)",
      [programId]
    );
    res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};
