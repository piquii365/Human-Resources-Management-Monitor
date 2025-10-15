import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const listEmployees = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_employees()"
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

export const getEmployee = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_employee_by_id(?)",
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

export const createEmployee = async (
  req: express.Request,
  res: express.Response
) => {
  const {
    id,
    user_id,
    employee_number,
    first_name,
    last_name,
    email,
    phone,
    department_id,
    position,
    hire_date,
    employment_status,
    salary,
    photo_url,
  } = req.body;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_insert_employee(?,?,?,?,?,?,?,?,?,?,?,?)", [
      id,
      user_id,
      employee_number,
      first_name,
      last_name,
      email,
      phone,
      department_id,
      position,
      hire_date,
      employment_status,
      salary,
      photo_url,
    ]);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const updateEmployee = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const payload = req.body;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_update_employee(?,?,?,?,?,?,?,?,?,?,?,?)", [
      id,
      payload.user_id,
      payload.employee_number,
      payload.first_name,
      payload.last_name,
      payload.email,
      payload.phone,
      payload.department_id,
      payload.position,
      payload.hire_date,
      payload.employment_status,
      payload.salary,
      payload.photo_url,
    ]);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const deleteEmployee = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_delete_employee(?)", [id]);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};
