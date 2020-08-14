import React, { useEffect, useState, useRef } from "react";
import useLocalStorageState from "use-local-storage-state";
import {
  AppBar,
  MenuItem,
  Menu,
  Button,
  Toolbar,
  Box,
  IconButton,
} from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import api from "./api";
import Kanban, { KanbanActions } from "./Kanban";
import classes from "./LoggedIn.module.css";

function LoggedIn() {
  const kanbanRef = useRef<KanbanActions>(null);
  const [sheetMenuEl, setSheetMenuEl] = useState<HTMLButtonElement>();
  const [sheets, setSheets] = useState<string[]>();
  const [sheet, setSheet] = useLocalStorageState<string>("sheet");

  useEffect(() => {
    api.listSheets().then((sheets) => {
      const names = sheets.map((sheet) => sheet.title);

      setSheets(names);

      if (!sheet || !names.includes(sheet)) {
        setSheet(names[0]);
      }
    });

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeSheet(sheet: string) {
    return () => {
      setSheet(sheet);
      setSheetMenuEl(undefined);
    };
  }

  if (!sheets || !sheet) {
    return null;
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Button
            color="inherit"
            onClick={(e) => setSheetMenuEl(e.target as HTMLButtonElement)}
            endIcon={<KeyboardArrowDownIcon />}
          >
            {sheet}
          </Button>
          <Menu
            open={Boolean(sheetMenuEl)}
            anchorEl={sheetMenuEl}
            onClose={() => setSheetMenuEl(undefined)}
          >
            {sheets.map((sheet) => (
              <MenuItem key={sheet} onClick={changeSheet(sheet)}>
                {sheet}
              </MenuItem>
            ))}
          </Menu>
          <Box marginRight="auto" />
          <IconButton
            color="inherit"
            onClick={(e) => kanbanRef.current && kanbanRef.current.refresh()}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => api.signOut()}>
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Kanban ref={kanbanRef} sheet={sheet} />
    </div>
  );
}

export default LoggedIn;
