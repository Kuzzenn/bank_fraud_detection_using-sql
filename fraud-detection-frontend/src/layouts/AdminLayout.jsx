// src/layouts/AdminLayout.jsx
import React from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

import DashboardIcon    from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WarningIcon      from "@mui/icons-material/Warning";
import GavelIcon        from "@mui/icons-material/Gavel";

export default function AdminLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar
        items={[
          {
            text: "Dashboard",
            icon: <DashboardIcon />,
            path: "/admin/dashboard",
          },
          {
            text: "Users",
            icon: <AccountCircleIcon />,
            path: "/admin/users",
          },
          {
            text: "Fraud Logs",
            icon: <WarningIcon />,
            path: "/admin/fraud-logs",
          },
          {
            text: "Fraud Rules",
            icon: <GavelIcon />,
            path: "/admin/fraud-rules",
          },
        ]}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          // offset for the persistent drawer width + appbar height
          ml: { sm: "260px" },  
          mt: "64px",
        }}
      >
        <Navbar />
        <Outlet />
      </Box>
    </Box>
  );
}
