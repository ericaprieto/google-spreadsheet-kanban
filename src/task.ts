import { Cell, Color } from "./api";

export interface Task {
  rowIndex: number;
  backgroundColor: Color;
  Story: string;
  "Task Name": string;
  Status: string;
  Dev?: string;
  "Start Time (Irish TIme)"?: string;
  "ETA [hours]"?: string;
  "Actual Hours"?: string;
  "Remaining Hours"?: string;
  "Meeting Hours"?: string;
  "Finish Time"?: string;
  "Start Development"?: string;
  "Estimated Completion"?: string;
  "End Development"?: string;
  Notes?: string;
  "Code Review Dev"?: string;
  "Code Review Started"?: string;
  "Code Review  [hours]"?: string;
  "QA Started"?: string;
  "QA Accepted"?: string;
  "QA Rejected"?: string;
  Bug?: string;
  "Bug Fixes [hours]"?: string;
}

export function colorToRgb(color: Color) {
  return `rgb(${Math.round((color.red || 0) * 255)},${Math.round(
    (color.green || 0) * 255
  )},${Math.round((color.blue || 0) * 255)})`;
}

export function createTask(rowIndex: number, row: Cell[], headers: string[]) {
  const task = (row.reduce(
    (task, cell, headerIndex) => ({
      ...task,
      [headers[headerIndex]]: cell.value,
    }),
    { rowIndex, backgroundColor: row[0].color }
  ) as any) as Task;

  if (!task["Task Name"] || !task.Status) {
    return null;
  }

  return task;
}
