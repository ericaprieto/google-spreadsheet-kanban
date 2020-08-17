import React from "react";
import { ButtonBase } from "@material-ui/core";
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
      {color !== "rgb(255,255,255)" && (
        <div className={classes.color} style={{ background: color }} />
      )}
      <div className={classes.inner}>
        {task.Story && <div className={classes.story}>{task.Story}</div>}
        <div className={classes.task}>{task["Task%20Name"]}</div>
      </div>
      <div className={classes.footer}>
        <span className={classes.line}>{`Line ${task.rowIndex + 1}`}</span>
        {task.Dev && <span className={classes.dev}>{task.Dev}</span>}
      </div>
    </ButtonBase>
  );
}

export default Task;
