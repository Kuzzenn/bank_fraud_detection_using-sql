// src/pages/Login.jsx
import React, { useState, useContext } from "react";
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
import { login as apiLogin } from "../api/service";
import { AuthContext } from "../contexts/AuthContext";

export default function Login() {
  const [form, setForm]       = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const { login: doLogin }    = useContext(AuthContext);
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // call your Flask endpoint
      const { access_token, role } = await apiLogin(form);

      // now store *both* token + role in context/localStorage
      doLogin(access_token, role);

      // redirect based on role
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/user/accounts",    { replace: true });
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={8} mx="auto" maxWidth={400}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2} align="center">
          Log In
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
            onChange={e =>
              setForm(f => ({ ...f, username: e.target.value }))
            }
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            required
            value={form.password}
            onChange={e =>
              setForm(f => ({ ...f, password: e.target.value }))
            }
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Log In"}
          </Button>
        </Box>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Don’t have an account?{" "}
            <MuiLink component={RouterLink} to="/signup">
              Sign Up
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
