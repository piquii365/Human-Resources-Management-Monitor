import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const listRecruitments = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_recruitments()"
    );
    res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const getRecruitment = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_recruitment_by_id(?)",
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

export const createRecruitment = async (
  req: express.Request,
  res: express.Response
) => {
  const payload = req.body;
  console.log(payload);
  const connection = await conn.getConnection();
  try {
    await connection.query(
      "CALL sp_create_recruitment(?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        payload.id,
        payload.job_title,
        payload.department_id,
        payload.description,
        payload.requirements,
        payload.position_type || "full_time",
        payload.salary_range,
        payload.posting_date,
        payload.closing_date,
        payload.status,
        payload.vacancies,
        payload.created_by,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const updateRecruitment = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const payload = req.body;
  const connection = await conn.getConnection();
  try {
    await connection.query(
      "CALL sp_update_recruitment(?,?,?,?,?,?,?,?,?,?,?)",
      [
        id,
        payload.job_title,
        payload.department_id,
        payload.description,
        payload.requirements,
        payload.position_type,
        payload.salary_range,
        payload.posting_date,
        payload.closing_date,
        payload.status,
        payload.vacancies,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const deleteRecruitment = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_delete_recruitment(?)", [id]);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};
