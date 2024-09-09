import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Handle uncaught exceptions
process.on("uncaughtException", err => {
  console.log("💥 Uncaught Exception Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

import app from "./app.js";
import { connectToDb } from "./db/workflow.db.js";
const httpServer = http.createServer(app);

connectToDb();

// Start server
const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}...`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: string, promise: Promise<any>) => {
  console.log("💥 Unhandled Rejection Shutting down...");
  console.log(reason);
  httpServer.close(() => {
    process.exit(1);
  });
});
