import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "..", "..", "public", "uploads"));
//   },
//   filename: function (req, file, cb) {
//     console.log(req);
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + file.originalname.split(".").pop();
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

const storage = multer.memoryStorage();

export const upload = multer({ storage: storage });
