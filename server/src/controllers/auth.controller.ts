import { body } from "express-validator";
import conn from "../config/db.config.js";
import { handleError } from "../utils/error.utils.js";
import express from "express";

export const register = async (req: express.Request, res: express.Response) => {
  const { name, email, uid, displayPicture } = req.body;
  const connection = await conn.getConnection();
  await connection.query("CALL sp_register(?, ?, ?, ?)", [
    name,
    email,
    uid,
    displayPicture,
  ]);
  try {
  } catch (error) {
    handleError(res, error);
  } finally {
    connection.release();
  }
};
