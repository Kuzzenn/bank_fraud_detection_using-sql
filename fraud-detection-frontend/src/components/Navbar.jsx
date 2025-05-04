// src/components/Navbar.jsx
import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import { AuthContext } from "../contexts/AuthContext";

const TITLE_MAP = {
  "/admin/dashboard":    "Dashboard",
  "/admin/users":        "Users",
  "/admin/fraud-logs":   "Fraud Logs",
  "/admin/fraud-rules":  "Fraud Rules",
  "/user/accounts":      "My Accounts",
  "/user/transactions":  "Transactions",
  "/user/transfer":      "Transfer Funds",
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Determine the title from the current pathname, fallback to system name
  const title =
    TITLE_MAP[location.pathname] || "Banking Fraud Detection System";

  const handleLogout = () => {
    logout();                // clear JWT & user
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      role="banner"
      sx={{
        background: "linear-gradient(90deg, #6A1B9A, #AB47BC)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.4)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: { xs: 0.5, sm: 1 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Left: Dynamic Page Title */}
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontWeight: "bold",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
          }}
        >
          {title}
        </Typography>

        {/* Right: User Info & Logout */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user?.username && (
            <Typography
              variant="body2"
              sx={{ color: "#FFFFFF", mr: 1, fontWeight: 500 }}
            >
              {user.username}
            </Typography>
          )}
          <IconButton
            onClick={handleLogout}
            aria-label="Log out"
            sx={{
              color: "#FFFFFF",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
