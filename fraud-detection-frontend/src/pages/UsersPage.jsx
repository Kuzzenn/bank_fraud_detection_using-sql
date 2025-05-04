// src/pages/UsersPage.jsx

import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Button,
} from "@mui/material";
import { fetchUsers } from "../api/service";

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const loadUsers = () => {
    setLoading(true);
    setError(null);
    fetchUsers()
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="outlined" onClick={loadUsers}>
          Retry
        </Button>
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        No users found.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Users
      </Typography>
      <TableContainer component={Paper} aria-label="Users table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>User ID</strong></TableCell>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>{user.user_id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
