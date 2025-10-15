import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection().catch((error) => {
  console.error("Error connecting to the database:", error);
  return Promise.reject(error);
});

export default pool;
