import conn from "../config/db.config.js";
import express from "express";
import { handleError } from "../utils/error.utils.js";

export const listUsers = async (
  req: express.Request,
  res: express.Response
) => {
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(`CALL sp_list_users()`);
    return res.json({ success: true, data: rows[0] || rows });
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
