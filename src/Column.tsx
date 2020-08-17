import React from "react";
import clsx from "clsx";
import Scrollbar from "react-scrollbars-custom";
import { Paper, Button, Chip } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";

import classes from "./Column.module.css";
import { Task as TaskType } from "./task";
import Task from "./Task";
import useLocalStorageState from "use-local-storage-state/dist";

function Column({
  sheet,
  status,
  tasks = [],
  onCreateTask,
  onTaskClick,
}: {
  sheet: string;
  status: string;
  tasks?: TaskType[];
  onCreateTask: (status: string) => void;
  onTaskClick: (task: TaskType) => void;
}) {
  const [collapsed, setCollapsed] = useLocalStorageState(
    `${sheet}__${status}__collapsed`,
    false
  );

  return (
    <Paper
      key={status}
      className={clsx(classes.root, collapsed && classes.collapsed)}
    >
      {collapsed ? (
        <div className={classes.title}>
          <Button
            variant="text"
            endIcon={<KeyboardArrowDownIcon />}
            onClick={() => setCollapsed(false)}
          >
            {status}{" "}
            <Chip
              size="small"
              color="default"
              label={tasks.length === 1 ? "1 task" : `${tasks.length} tasks`}
            />
          </Button>
        </div>
      ) : (
        <>
          <div className={classes.title}>
            <Button
              fullWidth
              variant="text"
              startIcon={<KeyboardArrowLeftIcon />}
              onClick={() => setCollapsed(true)}
            >
              {status}
            </Button>
          </div>
          <Scrollbar className={classes.listContainer} noScrollX>
            <div className={classes.list}>
              {tasks.map((task, index) => (
                <Task key={index} task={task} onClick={onTaskClick} />
              ))}
            </div>
          </Scrollbar>
          <Button startIcon={<AddIcon />} onClick={() => onCreateTask(status)}>
            New task
          </Button>
        </>
      )}
    </Paper>
  );
}

export default Column;
