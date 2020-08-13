export interface Task {
  rowIndex: number;
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

export function createTask(rowIndex: number, row: string[], headers: string[]) {
  const task = (row.reduce(
    (task, value, headerIndex) => ({
      ...task,
      [headers[headerIndex]]: value,
    }),
    { rowIndex }
  ) as any) as Task;

  if (!task["Task Name"] || !task.Status) {
    return null;
  }

  return task;
}
