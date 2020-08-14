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
import { CircularProgress } from "@material-ui/core";

interface KanbanProps {
  sheet: string;
}

export interface KanbanActions {
  refresh: () => void;
}

function Kanban({ sheet }: KanbanProps, ref: any) {
  const intervalRef = useRef<number>();
  const [tasks, setTasks] = useState<Task[]>();
  const [headers, setHeaders] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task>();

  const refresh = useCallback(
    function refresh() {
      api.getRows(sheet).then((rows) => {
        const [headerRows, ...rest] = rows;
        const headers = headerRows.map((row) =>
          row.value ? encodeURI(row.value) : row.value
        );

        const tasks = rest
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
      if (!tasks) {
        return;
      }

      const task = tasks.find(
        (task) => task.rowIndex === updatedTask.rowIndex
      ) as Task;

      setTasks((tasks = []) => {
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
        .then(() => {
          if (task.backgroundColor !== updatedTask.backgroundColor) {
            return api.setRowColor(
              sheet,
              updatedTask.rowIndex,
              updatedTask.backgroundColor
            );
          }
        })
        .then(() => refresh())
        .catch(() => {
          setTasks((tasks = []) => {
            const revertedTasks = [...tasks];
            revertedTasks[tasks.indexOf(updatedTask)] = task;
            return revertedTasks;
          });
        });
    },
    [tasks, sheet, refresh, headers]
  );

  const onCreate = useCallback(
    function onCreate(task: Task) {
      if (!tasks) {
        return;
      }

      const maxRowIndex = tasks.reduce(
        (max, task) => Math.max(max, task.rowIndex),
        0
      );

      const newTask = { ...task, rowIndex: maxRowIndex + 1 };

      setTasks((tasks = []) => [...tasks, newTask]);

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

  useEffect(() => {
    setTasks(undefined);
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

  const tasksByGroup = useMemo(
    () =>
      (tasks || []).reduce(
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

  if (typeof tasks === "undefined") {
    return (
      <div className={classes.rootLoading}>
        <CircularProgress />
      </div>
    );
  }

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
