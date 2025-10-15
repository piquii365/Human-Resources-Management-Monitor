import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const getCalendarEvents = async (
  req: express.Request,
  res: express.Response
) => {
  const { from, to } = req.query;
  const connection = await conn.getConnection();
  try {
    const fromDate = from ? String(from) : null;
    const toDate = to ? String(to) : null;
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_calendar_events(?,?)",
      [fromDate, toDate]
    );
    res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};
