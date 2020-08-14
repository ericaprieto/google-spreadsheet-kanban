import React from "react";
import { Typography, Chip, Avatar, Box, ButtonBase } from "@material-ui/core";
import { Task as TaskType, colorToRgb } from "./task";
import classes from "./Task.module.css";

function Task({
  task,
  onClick,
}: {
  task: TaskType;
  onClick: (task: TaskType) => void;
}) {
  const color = colorToRgb(task.backgroundColor);

  return (
    <ButtonBase className={classes.root} onClick={() => onClick(task)}>
      <div className={classes.inner}>
        <Box marginBottom="8px">
          <Typography>
            {`#${[task.rowIndex + 1, task.Story, task["Task Name"]]
              .filter(Boolean)
              .join(" ")}`}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="flex-end">
          {color !== "rgb(255,255,255)" && (
            <div className={classes.taskColor} style={{ color }} />
          )}
          {task.Dev && (
            <Chip
              className={classes.dev}
              avatar={<Avatar>{task.Dev.charAt(0)}</Avatar>}
              label={task.Dev}
              size="small"
            />
          )}
        </Box>
      </div>
    </ButtonBase>
  );
}

export default Task;
