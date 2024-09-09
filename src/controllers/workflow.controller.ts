import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.model.js";
import Workflow from "../models/workflow.model.js";
import { runWorkflowService } from "../services/workflow.service.js";
import { ApiRequest } from "../types/auth.type.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllWorkflow = catchAsync(async (req: ApiRequest, res, next) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError("User not found", 404);

  res.status(200).json(new ApiResponse(200, { workflows: user.workflow }, "All workflows fetched"));
});

export const saveWorkflow = catchAsync(async (req: ApiRequest, res, next) => {
  const { nodes, edges } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError("User not found", 404);

  if (!nodes || !edges) {
    throw new ApiError("Please provide nodes and edges", 400);
  }

  const workflow = await Workflow.create({ nodes, edges });
  user.workflow.push(workflow._id);
  await user.save();

  res.status(201).json(new ApiResponse(201, { workflow }, "Workflow created"));
});

export const startWorkflow = catchAsync(async (req: ApiRequest, res, next) => {
  const file = req.file;
  const flowId = req.body.flowId;

  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError("User not found", 404);

  if (!file) {
    throw new ApiError("Please provide a CSV file", 400);
  }

  const workflow = await Workflow.findById(flowId);
  if (!workflow) throw new ApiError("Workflow not found", 404);

  const originalExtension = path.extname(file.originalname);
  const newFilename = `${flowId}${originalExtension}`;

  // Use the `fs` module to save the file with the new name
  const uploadPath = path.join(__dirname, "..", "..", "public", "uploads", newFilename);

  fs.writeFile(uploadPath, file.buffer, err => {
    if (err) {
      throw new ApiError("Failed to upload CSV", 500);
    }
  });

  res.status(200).json(new ApiResponse(200, null, "Workflow started successfully"));
});

export const runWorkflow = async (req: ApiRequest, res, next) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const { flowId } = req.params;

  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError("User not found", 404);

  const workflow = await Workflow.findById(flowId);
  if (!workflow) throw new ApiError("Workflow not found", 404);

  await runWorkflowService(res, { nodes: workflow.nodes, edges: workflow.edges, flowId });
};
