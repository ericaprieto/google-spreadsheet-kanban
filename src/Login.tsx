import React from "react";
import api from "./api";
import { Button } from "@material-ui/core";

function Login() {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={api.signIn}
      style={{ margin: "auto" }}
    >
      Login with Google
    </Button>
  );
}

export default Login;
