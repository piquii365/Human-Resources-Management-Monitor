import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const upload = (foldername: string) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "..", "public", foldername));
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname +
          "-" +
          Math.round(Math.random() * 1e9) +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  });

  return multer({ storage: storage });
};
