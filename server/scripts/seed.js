import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load env from project root
dotenv.config({ path: path.join(process.cwd(), ".env") });

const SQL_FILE = path.join(process.cwd(), "sequelize.sql");

async function run() {
  if (!fs.existsSync(SQL_FILE)) {
    console.error("SQL file not found:", SQL_FILE);
    process.exit(1);
  }

  let sql = fs.readFileSync(SQL_FILE, "utf8");

  // Remove DELIMITER lines (e.g., DELIMITER $$) and replace custom-delimited blocks with a single-statement ending with ;
  // This handles patterns like: DELIMITER $$ ... $$ DELIMITER ;
  sql = sql.replace(/DELIMITER\s+\$\$/g, "");
  sql = sql.replace(/\$\$/g, ";");

  // Also remove any remaining DELIMITER ; lines
  sql = sql.replace(/DELIMITER\s+;/g, "");

  // Some clients don't like multiple statements in one query call; we'll split by semicolon and execute statements sequentially.
  // But we must be careful not to split inside procedural bodies; the above replacement tries to have procedures end with a single ;

  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || undefined,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    multipleStatements: true,
  });

  const conn = await pool.getConnection();
  try {
    console.log("Starting DB seed...");
    for (const stmt of statements) {
      // skip comments-only statements
      if (/^--/.test(stmt) || stmt.length === 0) continue;
      try {
        await conn.query(stmt + ";");
      } catch (err) {
        console.error("Failed statement:", stmt.substring(0, 200));
        throw err;
      }
    }
    console.log("DB seed completed successfully.");
  } catch (err) {
    console.error("Error seeding DB:", err);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
