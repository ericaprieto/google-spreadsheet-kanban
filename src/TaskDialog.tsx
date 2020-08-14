import React from "react";
import { Formik, Field, FieldProps } from "formik";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  DialogTitle,
  Box,
} from "@material-ui/core";
import { Task as TaskType } from "./task";
import ColorInput from "./ColorInput";

function validate(task: TaskType) {
  const errors: any = {};

  if (!task["Task%20Name"]) {
    errors["Task%20Name"] = "Required";
  }

  return errors;
}

function makeRenderField(team: string[], statuses: string[]) {
  return ({ field, meta }: FieldProps) => {
    const error = meta.touched && meta.error;

    if (field.name === "backgroundColor") {
      return (
        <ColorInput
          label="Row Color"
          name={field.name}
          value={field.value}
          onChange={field.onChange}
        />
      );
    }

    if (field.name === "Status") {
      return (
        <FormControl fullWidth variant="outlined">
          <InputLabel style={{ background: "white" }}>
            {decodeURI(field.name)}
          </InputLabel>
          <Select
            native
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (field.name === "Dev" || field.name === "Code%20Review%20Dev") {
      return (
        <FormControl fullWidth variant="outlined">
          <InputLabel style={{ background: "white" }}>
            {decodeURI(field.name)}
          </InputLabel>
          <Select
            native
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          >
            <option value=""></option>
            {team.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        fullWidth
        error={Boolean(error)}
        name={field.name}
        label={decodeURI(field.name)}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        helperText={error}
        variant="outlined"
      />
    );
  };
}

function TaskDialog({
  team,
  task,
  headers,
  statuses,
  onSave,
  onClose,
}: {
  team: string[];
  task: TaskType;
  headers: string[];
  statuses: string[];
  onSave: (task: TaskType) => void;
  onClose: () => void;
}) {
  const renderField = makeRenderField(team, statuses);

  function onSubmit(updatedTask: TaskType) {
    onSave(updatedTask);
    onClose();
  }

  const title = [task.rowIndex + 1, task.Story, task["Task%20Name"]]
    .filter(Boolean)
    .join(" ");

  return (
    <Formik initialValues={task} validate={validate} onSubmit={onSubmit}>
      {(props) => (
        <Dialog open fullWidth onClose={onClose}>
          <DialogTitle>
            <DialogContentText id="alert-dialog-description">
              {title ? `#${title}` : "New task"}
            </DialogContentText>
          </DialogTitle>
          <DialogContent>
            {["backgroundColor", ...headers].filter(Boolean).map((header) => (
              <Box key={header} marginBottom="16px">
                <Field name={header}>{renderField}</Field>
              </Box>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => {
                props.handleSubmit();
              }}
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Formik>
  );
}

export default TaskDialog;
