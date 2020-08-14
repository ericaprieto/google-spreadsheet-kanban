import { Cell, Color } from "./api";

export interface Task {
  rowIndex: number;
  backgroundColor: Color;
  Story: string;
  "Task%20Name": string;
  Status: string;
  Dev?: string;
  "Start%20Time%20(Irish%20TIme)"?: string;
  "ETA%20%5Bhours%5D"?: string;
  "Actual%20Hours"?: string;
  "Remaining%20Hours"?: string;
  "Meeting%20Hours"?: string;
  "Finish%20Time"?: string;
  "Start%20Development"?: string;
  "Estimated%20Completion"?: string;
  "End%20Development"?: string;
  Notes?: string;
  "Code%20Review%20Dev"?: string;
  "Code%20Review%20Started"?: string;
  "Code%20Review%20%20%5Bhours%5D"?: string;
  "QA%20Started"?: string;
  "QA%20Accepted"?: string;
  "QA%20Rejected"?: string;
  Bug?: string;
  "Bug%20Fixes%20%5Bhours%5D"?: string;
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

  if (!task["Task%20Name"] || !task.Status) {
    return null;
  }

  return task;
}
