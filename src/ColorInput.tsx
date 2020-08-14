import React from "react";
import { ButtonBase, Typography } from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import config from "./config.json";
import { Color } from "./api";
import { colorToRgb } from "./task";
import classes from "./ColorInput.module.css";

function asNumber(value: number | undefined) {
  return value || 0;
}

function isEqual(a: Color, b: Color) {
  return (
    asNumber(a.red) === asNumber(b.red) &&
    asNumber(a.green) === asNumber(b.green) &&
    asNumber(a.blue) === asNumber(b.blue)
  );
}

function ColorInput({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: Color;
  onChange: (event: { target: { name: string; value: Color } }) => void;
}) {
  const colors = [...config.colors];

  if (!colors.find((color) => isEqual(color, value))) {
    colors.push(value);
  }

  return (
    <div className={classes.root}>
      <Typography variant="body2" className={classes.label}>
        {label}
      </Typography>
      {colors.map((color) => (
        <ButtonBase
          key={colorToRgb(color)}
          className={classes.color}
          style={{ backgroundColor: colorToRgb(color) }}
          onClick={() => onChange({ target: { name, value: color } })}
        >
          {isEqual(color, value) && <CheckIcon htmlColor="#fff" />}
        </ButtonBase>
      ))}
    </div>
  );
}

export default ColorInput;
