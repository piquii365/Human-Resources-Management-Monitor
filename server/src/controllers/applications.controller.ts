import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const listApplicationsForRecruitment = async (
  req: express.Request,
  res: express.Response
) => {
  const { recruitmentId } = req.params;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_applications_by_recruitment(?)",
      [recruitmentId]
    );
    res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const getApplication = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_application_by_id(?)",
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

export const createApplication = async (
  req: express.Request,
  res: express.Response
) => {
  const payload = req.body;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_add_application(?,?,?,?,?,?,?,?)", [
      payload.id,
      payload.recruitment_id,
      payload.applicant_name,
      payload.applicant_email,
      payload.applicant_phone,
      payload.resume_url,
      payload.cover_letter,
      payload.application_date,
    ]);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const updateApplicationStatus = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const { status } = req.body;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_update_application_status(?,?)", [
      id,
      status,
    ]);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};
