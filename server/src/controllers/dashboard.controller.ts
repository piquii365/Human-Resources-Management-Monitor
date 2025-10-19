import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const getStats = async (req: express.Request, res: express.Response) => {
  const employeeId = req.query.employee_id || null;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      `CALL sp_get_dashboard_stats(?)`,
      [employeeId]
    );
    // sp returns multiple result sets; combine into a single object
    // rows may be an array of arrays depending on mysql2
    const results =
      Array.isArray(rows) && Array.isArray(rows[0])
        ? rows.map((r: any) => r[0] || r)
        : rows;
    return res.json({ success: true, data: results });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const getUpcomingEvents = async (
  req: express.Request,
  res: express.Response
) => {
  const days = Number(req.query.days) || 7;
  const employeeId = req.query.employee_id || null;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      `CALL sp_get_upcoming_events(?,?)`,
      [days, employeeId]
    );
    return res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const getNotifications = async (
  req: express.Request,
  res: express.Response
) => {
  const employeeId = req.query.employee_id || null;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      `CALL sp_get_dashboard_notifications(?)`,
      [employeeId]
    );
    return res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const getTasks = async (req: express.Request, res: express.Response) => {
  const employeeId = req.query.employee_id || null;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      `CALL sp_get_employee_tasks(?)`,
      [employeeId]
    );
    return res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const syncCalendar = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    await connection.query(`CALL sp_sync_all_calendar_events()`);
    return res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const appointHr = async (
  req: express.Request,
  res: express.Response
) => {
  const { uid } = req.body;
  if (!uid)
    return res.status(400).json({ success: false, message: "uid required" });
  const connection = await conn.getConnection();
  try {
    await connection.query(`CALL sp_set_user_role(?,?)`, [uid, "hr"]);
    return res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};
