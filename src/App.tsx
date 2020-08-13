import React, { useEffect, useState } from "react";
import api from "./api";
import LoggedIn from "./LoggedIn";
import Login from "./Login";

enum ApiState {
  NOT_LOADED = "not-loaded",
  LOGGED_IN = "logged-in",
  LOGGED_OUT = "logged-out",
}

function App() {
  const [apiState, setAPIState] = useState<ApiState>(ApiState.NOT_LOADED);

  useEffect(() => {
    api.init((loggedIn) =>
      setAPIState(loggedIn ? ApiState.LOGGED_IN : ApiState.LOGGED_OUT)
    );
  }, []);

  return apiState === ApiState.NOT_LOADED ? null : apiState ===
    ApiState.LOGGED_IN ? (
    <LoggedIn />
  ) : (
    <Login />
  );
}

export default App;
