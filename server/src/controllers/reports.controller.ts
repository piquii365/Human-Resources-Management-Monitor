import conn from "../config/db.config.js";
import express from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { pipeline } from "stream";
import { promisify } from "util";
import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
const pipelineAsync = promisify(pipeline);
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function rowsToCsv(rows: any[]): string {
  if (!rows || rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.join(",") + "\n";
  const lines = rows.map((r) =>
    keys
      .map((k) => {
        const v = r[k];
        if (v === null || v === undefined) return "";
        return String(v).replace(/"/g, '""');
      })
      .map((c) => `"${c}"`)
      .join(",")
  );
  return header + lines.join("\n");
}

async function rowsToXlsxBuffer(rows: any[], sheetName = "Report") {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  if (!rows || rows.length === 0) {
    ws.addRow(["No data"]);
  } else {
    const keys = Object.keys(rows[0]);
    ws.addRow(keys);
    rows.forEach((r) => ws.addRow(keys.map((k) => r[k])));
  }
  const buf = await wb.xlsx.writeBuffer();
  return buf;
}

function rowsToPdfStream(rows: any[], docTitle = "Report") {
  const doc = new PDFDocument({ margin: 30, size: "A4" });
  doc.fontSize(14).text(docTitle, { align: "left" }).moveDown(0.5);
  if (!rows || rows.length === 0) {
    doc.fontSize(10).text("No data");
    doc.end();
    return doc;
  }
  const keys = Object.keys(rows[0]);
  // simple table header
  doc.fontSize(10);
  const header = keys.map((k) => k.toUpperCase()).join(" | ");
  doc.text(header).moveDown(0.25);
  rows.forEach((r) => {
    const line = keys
      .map((k) => (r[k] === null || r[k] === undefined ? "" : String(r[k])))
      .join(" | ");
    doc.text(line);
  });
  doc.end();
  return doc;
}

async function streamToFile(stream: any, filePath: string) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await pipelineAsync(stream, fs.createWriteStream(filePath));
}

async function callProcedure(
  connection: any,
  procName: string,
  params: any[] = []
) {
  const [rows]: [any[], any] = await connection.query(
    `CALL ${procName}(${params.map(() => "?").join(",")})`,
    params
  );
  // mysql returns rows in nested arrays for CALL
  return rows[0] || rows;
}

export const getReport = async (
  req: express.Request,
  res: express.Response
) => {
  const { reportName } = req.params;
  const format = (req.query.format as string) || "json";
  const save = req.query.save === "1" || req.query.save === "true";
  const months = req.query.months ? Number(req.query.months) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const year = req.query.year ? Number(req.query.year) : undefined;

  const connection = await conn.getConnection();
  try {
    // build absolute base URL for saved report links
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    let rows: any[] = [];
    switch (reportName) {
      case "employee_directory":
        rows = await callProcedure(connection, "sp_report_employee_directory");
        break;
      case "department_distribution":
        rows = await callProcedure(
          connection,
          "sp_report_department_distribution"
        );
        break;
      case "employment_status":
        rows = await callProcedure(connection, "sp_report_employment_status");
        break;
      case "new_hires":
        rows = await callProcedure(connection, "sp_report_new_hires", [
          months ?? 12,
        ]);
        break;
      case "evaluation_summary":
        rows = await callProcedure(connection, "sp_report_evaluation_summary");
        break;
      case "top_performers":
        rows = await callProcedure(connection, "sp_report_top_performers", [
          limit ?? 10,
        ]);
        break;
      case "performance_trends":
        rows = await callProcedure(connection, "sp_report_performance_trends", [
          year ?? new Date().getFullYear(),
        ]);
        break;
      case "open_positions":
        rows = await callProcedure(connection, "sp_report_open_positions");
        break;
      case "application_pipeline":
        rows = await callProcedure(
          connection,
          "sp_report_application_pipeline"
        );
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Unknown report" });
    }

    if (format === "json") {
      if (save) {
        const dir = path.resolve(__dirname, "../../public/reports");
        await fsp.mkdir(dir, { recursive: true });
        const filename = `${reportName}_${Date.now()}.json`;
        const filepath = path.join(dir, filename);
        await fsp.writeFile(filepath, JSON.stringify(rows, null, 2), "utf8");
        return res.json({
          success: true,
          url: `${baseUrl}/public/reports/${filename}`,
        });
      }
      return res.json({ success: true, data: rows });
    }

    if (format === "csv") {
      const csv = rowsToCsv(rows);
      if (save) {
        const dir = path.resolve(__dirname, "../../public/reports");
        await fsp.mkdir(dir, { recursive: true });
        const filename = `${reportName}_${Date.now()}.csv`;
        const filepath = path.join(dir, filename);
        await fsp.writeFile(filepath, csv, "utf8");
        return res.json({
          success: true,
          url: `${baseUrl}/public/reports/${filename}`,
        });
      }
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${reportName}.csv"`
      );
      return res.send(csv);
    }

    if (format === "xlsx") {
      const buf = await rowsToXlsxBuffer(rows, reportName);
      if (save) {
        const dir = path.resolve(__dirname, "../../public/reports");
        await fsp.mkdir(dir, { recursive: true });
        const filename = `${reportName}_${Date.now()}.xlsx`;
        const filepath = path.join(dir, filename);
        await fsp.writeFile(filepath, buf as any);
        return res.json({
          success: true,
          url: `${baseUrl}/public/reports/${filename}`,
        });
      }
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${reportName}.xlsx"`
      );
      return res.send(buf);
    }

    if (format === "pdf") {
      const doc = rowsToPdfStream(rows, reportName.replace("_", " "));
      if (save) {
        const dir = path.resolve(__dirname, "../../public/reports");
        await fsp.mkdir(dir, { recursive: true });
        const filename = `${reportName}_${Date.now()}.pdf`;
        const filepath = path.join(dir, filename);
        await streamToFile(doc, filepath);
        return res.json({
          success: true,
          url: `${baseUrl}/public/reports/${filename}`,
        });
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${reportName}.pdf"`
      );
      return pipeline(doc, res, (err) => {
        if (err) console.error("PDF stream error", err);
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Unsupported format" });
  } catch (err) {
    console.error("Report error", err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    connection.release();
  }
};
