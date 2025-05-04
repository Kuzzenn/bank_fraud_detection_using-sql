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
import { Menu as MenuIcon } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

/**
 * A reusable Sidebar component that accepts dynamic menu items.
 * Props:
 * - items: Array<{ text: string, icon: ReactNode, path: string }>
 */
export default function Sidebar({ items }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const toggleDrawer = (openState) => () => setOpen(openState);

  // Determine the active item by matching the current pathname
  const isActive = (path) => location.pathname === path;

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
            "&:hover": { backgroundColor: "#3a3a3a" },
            boxShadow: "0px 4px 12px rgba(0,0,0,0.4)",
          }}
          aria-label="open menu"
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        variant={isMobile ? "temporary" : "persistent"}
        sx={{
          width: 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            pt: 8,
            backgroundColor: '#1e1e1e',
            color: '#FFFFFF',
            borderRight: '1px solid #333',
            boxShadow: '4px 0 12px rgba(0,0,0,0.6)',
          },
        }}
      >
        <Box sx={{ mt: 4 }} role="navigation">
          <List>
            {items.map(({ text, icon, path }) => (
              <ListItem
                button
                key={text}
                component={Link}
                to={path}
                onClick={toggleDrawer(false)}
                sx={{
                  mb: 1,
                  borderRadius: '8px',
                  mx: 2,
                  backgroundColor: isActive(path) ? '#BB86FC33' : 'transparent',
                  color: isActive(path) ? '#BB86FC' : '#ccc',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#BB86FC22',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive(path) ? '#BB86FC' : '#888', minWidth: 40 }}>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{ fontSize: '16px', fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
