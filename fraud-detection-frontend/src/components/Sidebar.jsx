import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountCircle,
  Receipt,
  Gavel,
  Warning,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const toggleDrawer = (openState) => () => setOpen(openState);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Users", icon: <AccountCircle />, path: "/users" },
    { text: "Transactions", icon: <Receipt />, path: "/transactions" },
    { text: "Fraud Logs", icon: <Warning />, path: "/fraud-logs" },
    { text: "Fraud Rules", icon: <Gavel />, path: "/fraud-rules" },
    { text: "Accounts", icon: <AccountCircle />, path: "/accounts" },
  ];

  return (
    <>
      {!open && (
        <IconButton
          onClick={toggleDrawer(true)}
          sx={{
            color: "#BB86FC",
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: "#2C2C2C",
            "&:hover": {
              backgroundColor: "#3a3a3a",
            },
            boxShadow: "0px 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 260,
            pt: 8,
            backgroundColor: "#1e1e1e",
            color: "#FFFFFF",
            borderRight: "1px solid #333",
            boxShadow: "4px 0 12px rgba(0,0,0,0.6)",
          },
        }}
      >
        <Box sx={{ mt: 4 }}>
          <List>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem
                  button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  onClick={toggleDrawer(false)}
                  sx={{
                    mb: 1,
                    borderRadius: "8px",
                    mx: 2,
                    backgroundColor: isActive ? "#BB86FC33" : "transparent",
                    color: isActive ? "#BB86FC" : "#ccc",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "#BB86FC22",
                      color: "#fff",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "#BB86FC" : "#888",
                      minWidth: "40px",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
