import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const listDepartments = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_departments()"
    );
    // mysql2 returns an array with results; procedures often return results in [0]
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

export const getDepartment = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_department_by_id(?)",
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

export const createDepartment = async (
  req: express.Request,
  res: express.Response
) => {
  const { id, name, code, description, head_employee_id } = req.body;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_create_department(?,?,?,?,?)", [
      id,
      name,
      code,
      description,
      head_employee_id,
    ]);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const updateDepartment = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const { name, code, description, head_employee_id } = req.body;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_update_department(?,?,?,?,?)", [
      id,
      name,
      code,
      description,
      head_employee_id,
    ]);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};

export const deleteDepartment = async (
  req: express.Request,
  res: express.Response
) => {
  const { id } = req.params;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_delete_department(?)", [id]);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  } finally {
    connection.release();
  }
};
