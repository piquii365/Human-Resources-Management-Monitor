import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const listEvaluations = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const { department_id, status, evaluation_year, limit, offset } = req.query;
    const p_department_id = department_id ?? null;
    const p_status = status ?? null;
    const p_evaluation_year = evaluation_year ? Number(evaluation_year) : null;
    const p_limit = limit ? Number(limit) : 100;
    const p_offset = offset ? Number(offset) : null;

    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_all_evaluations()",
      []
    );
    const data =
      Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0])
        ? rows[0]
        : rows;
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const getEvaluationById = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_evaluation_by_id(?)",
      [id]
    );
    const data =
      rows && rows[0] && rows[0][0]
        ? rows[0][0]
        : rows && rows[0]
        ? rows[0]
        : rows;
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const getEvaluationsByEmployee = async (
  req: express.Request,
  res: express.Response
) => {
  const { employee_id } = req.params;
  const { status, limit } = req.query;
  const p_status = status ?? null;
  const p_limit = limit ? Number(limit) : null;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_evaluations_by_employee(?,?,?)",
      [employee_id, p_status, p_limit]
    );
    const data =
      Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0])
        ? rows[0]
        : rows;
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const createEvaluation = async (
  req: express.Request,
  res: express.Response
) => {
  const payload = req.body;
  const connection = await conn.getConnection();
  try {
    await connection.query(
      "CALL sp_create_evaluation(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        payload.id || null,
        payload.employee_id,
        payload.evaluator_id,
        payload.evaluation_period,
        payload.evaluation_date,
        payload.performance_score,
        payload.technical_skills,
        payload.communication,
        payload.teamwork,
        payload.leadership,
        payload.punctuality,
        payload.comments || null,
        payload.goals_met ? 1 : 0,
        payload.status || "draft",
      ]
    );
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const updateEvaluation = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const p = req.body;
  const connection = await conn.getConnection();
  try {
    await connection.query(
      "CALL sp_update_evaluation(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        id,
        p.employee_id,
        p.evaluator_id,
        p.evaluation_period,
        p.evaluation_date,
        p.performance_score,
        p.technical_skills,
        p.communication,
        p.teamwork,
        p.leadership,
        p.punctuality,
        p.comments || null,
        p.goals_met ? 1 : 0,
        p.status,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const deleteEvaluation = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_delete_evaluation(?)", [id]);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};
