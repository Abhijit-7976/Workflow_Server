import { model, Schema } from "mongoose";
import { WorkflowDocument, WorkflowModel } from "../types/workflow.type.js";

const workflowSchema = new Schema<WorkflowDocument, WorkflowModel>({
  nodes: {
    type: [Object],
    required: [true, "Please provide nodes!"],
  },
  edges: {
    type: [Object],
    required: [true, "Please provide edges!"],
  },
});

export default model<WorkflowDocument, WorkflowModel>("Workflow", workflowSchema);
