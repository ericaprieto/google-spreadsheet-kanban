import React from "react";
import Scrollbar from "react-scrollbars-custom";
import { Paper, Typography, Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import classes from "./Column.module.css";
import { Task as TaskType } from "./task";
import Task from "./Task";

function Column({
  status,
  tasks,
  statuses,
  team,
  onCreateTask,
  onTaskClick,
}: {
  status: string;
  tasks?: TaskType[];
  statuses: string[];
  team: string[];
  onCreateTask: (status: string) => void;
  onTaskClick: (task: TaskType) => void;
}) {
  return (
    <Paper key={status} className={classes.root}>
      <Typography className={classes.title} component="h2">
        {status}
      </Typography>
      <Scrollbar className={classes.listContainer} noScrollX>
        <div className={classes.list}>
          {(tasks || []).map((task, index) => (
            <Task key={index} task={task} onClick={onTaskClick} />
          ))}
        </div>
      </Scrollbar>
      <Button startIcon={<AddIcon />} onClick={() => onCreateTask(status)}>
        New task
      </Button>
    </Paper>
  );
}

export default Column;
