import conn from "../config/db.config";

export const getRole = async (identifier: string): Promise<string | null> => {
  const connection = await conn.getConnection();
  try {
    const [rows]: [any[], any] = await connection.query(
      "CALL sp_get_user_role(?)",
      [identifier]
    );
    // mysql2 returns nested result sets for CALL — rows[0] is usually the actual rows
    const resultRows =
      Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    if (!resultRows || resultRows.length === 0) return null;
    const first = resultRows[0];
    // assume stored proc returns { id, uid, role }
    return first.role ?? null;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};
