import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { upload } from "./middlewares/multer.middleware.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import workflowRouter from "./routes/workflow.route.js";
import { convertFormat, filterData, wait } from "./services/workflow.service.js";
import ApiError from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import catchAsync from "./utils/catchAsync.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN || false,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "16kb" }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/workflow", workflowRouter);

app.get(
  "/api/v1/events",
  catchAsync(async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    console.log("events");

    // Simulate task completion with a delay
    // let task = 1;

    // while (task < 5) {
    //   if (task == 3) {
    //     const response = new ApiResponse(400, { count: task, failed: true }, "Task failed");
    //     res.write(`data: ${JSON.stringify(response)}\n\n`);
    //     res.end();
    //     break;
    //   }

    //   const response = new ApiResponse(200, { count: task, completed: false }, "A task completed");
    //   // Send each task completion
    //   res.write(`data: ${JSON.stringify(response)}\n\n`);
    //   await wait({ ms: 2000 });
    //   task++;
    // }

    // if (task == 5) {
    //   // Stop after 5 tasks (or any number you want)
    //   const response = new ApiResponse(200, { count: task, completed: true }, "All tasks completed");
    //   // Send each task completion
    //   res.write(`data: ${JSON.stringify(response)}\n\n`);
    //   res.end();
    // }

    const response = new ApiResponse(200, { count: 1, completed: true }, "All tasks completed");
    res.write(`data: ${JSON.stringify(response)}\n\n`);
    res.end();
  })
);

app.post("/api/v1/upload", upload.single("csvFile"), async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) throw new ApiError("Please provide a CSV file", 400);

  const updatedPath = await filterData({ csvPath: filePath });

  res.status(200).json(new ApiResponse(200, { updatedPath }, "File uploaded and processed successfully"));
});

app.post("/api/v1/toJson", upload.single("csvFile"), async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) throw new ApiError("Please provide a CSV file", 400);

  const result = await convertFormat({ csvPath: filePath });

  res.status(200).json(new ApiResponse(200, { result }, "File uploaded and processed successfully"));
});
export default app;
