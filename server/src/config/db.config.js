import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.warn(
    "Missing DB environment variables (DB_HOST, DB_USER, DB_NAME) — check .env"
  );
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: process.env.DB_CONNECT_TIMEOUT
    ? Number(process.env.DB_CONNECT_TIMEOUT)
    : 10000,
});

async function verifyConnection(retries = 5, baseDelayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      conn.release();
      console.log("Connected to the database.");
      return;
    } catch (error) {
      const msg = error && error.message ? error.message : String(error);
      console.error(`Database connection attempt ${attempt} failed: ${msg}`);
      if (attempt < retries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1); // exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error(
          "All database connection attempts failed. Continuing without active DB connection."
        );
      }
    }
  }
}

// Start verification but don't throw on failure to avoid crashing on import; callers can handle runtime DB absence.
verifyConnection().catch((err) => {
  console.error("Unexpected error during DB verification:", err);
});

export default pool;
