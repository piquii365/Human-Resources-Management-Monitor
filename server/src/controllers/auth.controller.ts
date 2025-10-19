import conn from "../config/db.config.js";
import { handleError } from "../utils/error.utils.js";
import express from "express";
import { getRole } from "../helpers/auth.helper";

export const register = async (req: express.Request, res: express.Response) => {
  const { name, email, uid, displayPicture, role } = req.body;
  const connection = await conn.getConnection();
  try {
    await connection.query("CALL sp_register(?, ?, ?, ?, ?)", [
      name,
      email,
      uid,
      displayPicture,
      role,
    ]);
    res.json({ success: true, message: "Registered" });
  } catch (error) {
    handleError(res, error);
  } finally {
    connection.release();
  }
};

export const getMe = async (req: express.Request, res: express.Response) => {
  // req.user is populated by authenticate middleware (decoded token)
  const u = (req as any).user;
  if (!u)
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });

  try {
    const identifier = u.uid || u.email;
    const role = identifier ? await getRole(identifier) : null;
    const data = { uid: u.uid, email: u.email, name: u.name, role };
    return res.json({ success: true, data });
  } catch (err) {
    console.error("getMe role lookup failed", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get user role" });
  }
};
