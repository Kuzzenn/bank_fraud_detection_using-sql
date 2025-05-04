// src/layouts/UserLayout.jsx
import React from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptIcon        from "@mui/icons-material/Receipt";
import SendIcon           from "@mui/icons-material/Send";

export default function UserLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar
        items={[
          {
            text: "My Accounts",
            icon: <AccountBalanceIcon />,
            path: "/user/accounts",
          },
          {
            text: "Transactions",
            icon: <ReceiptIcon />,
            path: "/user/transactions",
          },
          {
            text: "Transfer",
            icon: <SendIcon />,
            path: "/user/transfer",
          },
        ]}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          // only add left margin on non-mobile so the content isn't hidden under the drawer
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
