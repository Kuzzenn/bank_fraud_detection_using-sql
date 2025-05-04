// src/pages/Signup.jsx

import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Box,
  Typography,
  Link as MuiLink,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { signup as apiSignup } from "../api/service";

export default function Signup() {
  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const navigate               = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiSignup(form);
      // Optional: show a snackbar instead of alert
      alert("Account created! Please log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.username && form.email && form.password;

  return (
    <Box mt={8} mx="auto" maxWidth={400}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Sign Up
        </Typography>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            fullWidth
            margin="normal"
            required
            value={form.username}
            onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            required
            value={form.email}
            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            required
            value={form.password}
            onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading || !isFormValid}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
        </Box>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Already have an account?{" "}
            <MuiLink component={RouterLink} to="/login">
              Log In
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
