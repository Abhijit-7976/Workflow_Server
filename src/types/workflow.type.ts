import { Document, Model, Types } from "mongoose";

export interface IWorkflow {
  nodes: object[];
  edges: object[];
}

export interface WorkflowDocument extends IWorkflow, Document<any, {}, IWorkflow> {
  _id: Types.ObjectId;
  _doc: IWorkflow;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowModel extends Model<WorkflowDocument> {}
