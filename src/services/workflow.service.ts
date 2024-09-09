import axios from "axios";
import csv from "csv-parser";
import { Response } from "express";
import { writeToPath } from "fast-csv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ApiResponse } from "../utils/ApiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUEST_CATCHER_BASE_URL = process.env.REQUEST_CATCHER_URL || "https://abhijit-workflow-57.requestcatcher.com";

interface CSVRow {
  [key: string]: string;
}

enum TaskTypes {
  Start = "Start",
  End = "End",
  FilterData = "Filter Data",
  Wait = "Wait",
  ConvertFormat = "Convert Format",
  SendPOSTRequest = "Send POST Request",
}
interface Node {
  id: string;
  data: { label: TaskTypes };
}

interface Edge {
  source: string;
  target: string;
}

interface TreeNode {
  id: string;
  label: TaskTypes;
  children: TreeNode[];
}

export const runWorkflowService = async (res: Response, { nodes, edges, flowId }: { nodes: Node[]; edges: Edge[]; flowId: string }) => {
  const filename = flowId + ".csv";
  const csvPath = path.join(__dirname, "..", "..", "public", "uploads", filename);

  const totalTasks = nodes.length - 2; // Exclude the start and end nodes

  const nodeMap: { [key: string]: TreeNode } = {};
  let root: TreeNode | null = null;

  // Initialize nodes in the map
  nodes.forEach(node => {
    nodeMap[node.id] = { id: node.id, label: node.data.label, children: [] };
    if (node.data.label === TaskTypes.Start) {
      root = nodeMap[node.id];
    }
  });

  // Build the tree structure from edges
  edges.forEach(edge => {
    const parent = nodeMap[edge.source];
    const child = nodeMap[edge.target];

    if (parent && child) {
      parent.children.push(child);
    }
  });

  // Execute the workflow
  let csvFilePath = csvPath;
  let task = 0;

  async function traverse(node: TreeNode | null) {
    if (!node) return;

    // Visit the current node
    switch (node.label) {
      case TaskTypes.FilterData:
        csvFilePath = await filterData({ csvPath: csvFilePath });
        task++;
        res.write(`data: ${JSON.stringify(new ApiResponse(200, { count: task, total: totalTasks, completed: false }, "A tasks completed"))}\n\n`);
        break;

      case TaskTypes.Wait:
        await wait({ ms: 60000 });
        task++;
        res.write(`data: ${JSON.stringify(new ApiResponse(200, { count: task, total: totalTasks, completed: false }, "A tasks completed"))}\n\n`);
        break;

      case TaskTypes.ConvertFormat:
        await convertFormat({ csvPath: csvFilePath });
        task++;
        res.write(`data: ${JSON.stringify(new ApiResponse(200, { count: task, total: totalTasks, completed: false }, "A tasks completed"))}\n\n`);
        break;

      case TaskTypes.SendPOSTRequest:
        const url = REQUEST_CATCHER_BASE_URL + "/flow";
        await sendPostRequest({ url, data: { csvFilePath } });
        task++;
        res.write(`data: ${JSON.stringify(new ApiResponse(200, { count: task, total: totalTasks, completed: false }, "A tasks completed"))}\n\n`);
        break;

      case TaskTypes.End:
        task++;
        res.write(`data: ${JSON.stringify(new ApiResponse(200, { count: task, total: totalTasks, completed: true }, "All tasks completed"))}\n\n`);
        res.end();
        break;
    }

    // Visit each child node
    for (const child of node.children) {
      await traverse(child);
    }
  }

  await traverse(root);
};

export const filterData = ({ csvPath }: { csvPath: string }): Promise<string> => {
  return new Promise((resolve, reject) => {
    const results: CSVRow[] = [];
    const updatedCsvName = "updated" + Date.now() + "-" + Math.round(Math.random() * 1e9) + ".csv";
    const updatedCsvPath = path.join(__dirname, "..", "..", "public", "uploads", updatedCsvName);

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row: CSVRow) => {
        const lowerCaseRow: CSVRow = {};
        Object.keys(row).forEach(key => {
          lowerCaseRow[key] = row[key].toLowerCase();
        });
        results.push(lowerCaseRow);
      })
      .on("end", () => {
        writeToPath(updatedCsvPath, results, { headers: true })
          .on("finish", () => {
            fs.unlinkSync(csvPath);
            resolve(updatedCsvPath);
          })
          .on("error", err => {
            reject(err);
          });
      });

    return updatedCsvPath;
  });
};

export const wait = ({ ms }: { ms: number }) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const convertFormat = ({ csvPath }: { csvPath: string }): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    const results: CSVRow[] = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row: CSVRow) => {
        results.push(row);
      })
      .on("end", () => {
        fs.unlinkSync(csvPath);
        resolve(results);
      })
      .on("error", err => {
        reject(err);
      });
  });
};

export const sendPostRequest = async ({ url, data }: { url: string; data: object }) => {
  await axios.post(url, data);
};
