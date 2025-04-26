import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";

const drawerWidth = 240;

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          {[
            { text: "Dashboard", route: "/dashboard" },
            { text: "Users", route: "/users" },
            { text: "Transactions", route: "/transactions" },
            { text: "Fraud Logs", route: "/fraud-logs" },
            { text: "Fraud Rules", route: "/fraud-rules" },
            { text: "Accounts", route: "/accounts" },
          ].map((item, index) => (
            <ListItem button component={Link} to={item.route} key={index}>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
