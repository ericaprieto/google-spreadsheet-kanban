import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import Scrollbar from "react-scrollbars-custom";
import config from "./config.json";
import api from "./api";
import { Task, createTask } from "./task";
import Column from "./Column";
import TaskDialog from "./TaskDialog";
import classes from "./Kanban.module.css";

interface KanbanProps {
  sheet: string;
}

export interface KanbanActions {
  refresh: () => void;
}

function Kanban({ sheet }: KanbanProps, ref: any) {
  const intervalRef = useRef<number>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task>();

  const refresh = useCallback(
    function refresh() {
      api.getRows(sheet).then((rows) => {
        const headers = rows.shift() as string[];

        const tasks = rows
          .map((row, index) => createTask(index + 1, row, headers))
          .filter(Boolean) as Task[];

        const statuses = new Set(config.statuses);

        tasks.forEach((task) => {
          if (task.Status) {
            statuses.add(task.Status);
          }
        });

        setTasks(tasks);
        setHeaders(headers);
        setStatuses(Array.from(statuses));
      });
    },
    [sheet]
  );

  const onUpdate = useCallback(
    function onUpdate(updatedTask: Task) {
      const task = tasks.find(
        (task) => task.rowIndex === updatedTask.rowIndex
      ) as Task;

      setTasks((tasks) => {
        const updatedTasks = [...tasks];
        updatedTasks[tasks.indexOf(task)] = updatedTask;
        return updatedTasks;
      });

      api
        .updateCells(
          sheet,
          headers.map((header, index) => [
            index,
            updatedTask.rowIndex,
            (updatedTask as any)[header],
          ])
        )
        .then(
          () => {
            return refresh();
          },
          () => {
            setTasks((tasks) => {
              const revertedTasks = [...tasks];
              revertedTasks[tasks.indexOf(updatedTask)] = task;
              return revertedTasks;
            });
          }
        );
    },
    [tasks, sheet, refresh, headers]
  );

  const onCreate = useCallback(
    function onCreate(task: Task) {
      const maxRowIndex = tasks.reduce(
        (max, task) => Math.max(max, task.rowIndex),
        0
      );

      const newTask = { ...task, rowIndex: maxRowIndex + 1 };

      setTasks((tasks) => [...tasks, newTask]);

      api.insertRowAfter(sheet, maxRowIndex).then(
        () => {
          onUpdate(newTask);
        },
        () => {
          setTasks(tasks);
        }
      );
    },
    [sheet, tasks, onUpdate]
  );

  const onCreateTask = useCallback(
    function onCreateTask(status: string) {
      setSelectedTask(
        headers.reduce(
          (task, header) => ({
            [header]: "",
            ...task,
          }),
          { Status: status } as Task
        )
      );
    },
    [headers]
  );

  const tasksByGroup = useMemo(
    () =>
      tasks.reduce(
        (acc, task) => ({
          ...acc,
          [task.Status]: acc[task.Status]
            ? [...acc[task.Status], task]
            : [task],
        }),
        {} as { [status: string]: Task[] }
      ),
    [tasks]
  );

  useEffect(() => {
    setTasks([]);
    setStatuses([]);
    setHeaders([]);
    setSelectedTask(undefined);
    refresh();

    intervalRef.current = window.setInterval(refresh, 60000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [sheet, refresh]);

  useImperativeHandle(ref, () => ({ refresh }), [refresh]);

  return (
    <Scrollbar className={classes.root} noScrollY>
      {selectedTask && (
        <TaskDialog
          team={config.team}
          task={selectedTask}
          headers={headers}
          statuses={statuses}
          onSave={selectedTask.rowIndex ? onUpdate : onCreate}
          onClose={() => setSelectedTask(undefined)}
        />
      )}
      <div className={classes.columns}>
        {statuses.map((status) => (
          <Column
            key={status}
            team={config.team}
            status={status}
            tasks={tasksByGroup[status]}
            statuses={statuses}
            onCreateTask={onCreateTask}
            onTaskClick={setSelectedTask}
          />
        ))}
      </div>
    </Scrollbar>
  );
}

export default forwardRef<KanbanActions, KanbanProps>(Kanban);
