import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const Navbar = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        background: "linear-gradient(90deg, #6A1B9A, #AB47BC)",
        zIndex: 1201,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.4)",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "center",
          py: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: "1.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Banking Fraud Detection System
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
