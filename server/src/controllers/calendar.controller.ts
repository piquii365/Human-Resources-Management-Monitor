import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const getCalendarEvents = async (
  req: express.Request,
  res: express.Response
) => {
  const { from, to, employee_id, event_types } = req.query;
  const connection = await conn.getConnection();
  try {
    const fromDate = from ? String(from) : null;
    const toDate = to ? String(to) : null;
    const empId = employee_id ? String(employee_id) : null;
    // event_types can be passed as JSON string or plain string; pass null if not provided
    const evTypes = event_types ? String(event_types) : null;
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_calendar_events(?,?,?,?)",
      [fromDate, toDate, empId, evTypes]
    );
    res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const createCalendarEvent = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const {
      title,
      description,
      event_type,
      start_date,
      end_date,
      location,
      related_table,
      related_id,
      organizer_id,
      attendees,
      color,
      is_recurring,
      recurrence_pattern,
      created_by,
    } = req.body;

    const [rows]: [any[], any] = await connection.query(
      `CALL sp_create_calendar_event(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        title || null,
        description || null,
        event_type || null,
        start_date || null,
        end_date || null,
        location || null,
        related_table || null,
        related_id || null,
        organizer_id || null,
        attendees ? JSON.stringify(attendees) : null,
        color || null,
        is_recurring ? Boolean(is_recurring) : false,
        recurrence_pattern ? JSON.stringify(recurrence_pattern) : null,
        created_by || null,
      ]
    );
    // stored proc selects created row
    return res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const updateCalendarEvent = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const eventId = req.params.id;
    const {
      title,
      description,
      start_date,
      end_date,
      location,
      attendees,
      status,
      color,
    } = req.body;
    const [rows]: [any[], any] = await connection.query(
      `CALL sp_update_calendar_event(?,?,?,?,?,?,?,?,?)`,
      [
        eventId,
        title || null,
        description || null,
        start_date || null,
        end_date || null,
        location || null,
        attendees ? JSON.stringify(attendees) : null,
        status || null,
        color || null,
      ]
    );
    return res.json({ success: true, data: rows[0] || rows });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const deleteCalendarEvent = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const eventId = req.params.id;
    await connection.query(`CALL sp_delete_calendar_event(?)`, [eventId]);
    return res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};
