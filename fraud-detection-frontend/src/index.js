// src/index.js
import React from "react";
import ReactDOM from "react-dom";               // or 'react-dom/client' in React 18+
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import AuthProvider from "./contexts/AuthContext";
import App from "./App";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#BB86FC" },
    background: { default: "#121212", paper: "#1E1E1E" },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
