// src/pages/ManageFraudRules.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import { fetchFraudRules, createFraudRule } from "../api/service";

export default function ManageFraudRules() {
  const [rules, setRules]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData]     = useState({
    rule_name:        "",
    rule_description: "",
    action:           "",
    risk_level:       "",
    precedence:       "",
  });

  // Fetch rules from the server
  const loadRules = () => {
    setLoading(true);
    setError(null);
    fetchFraudRules()
      .then((data) => setRules(data))
      .catch((err) => setError(err.message || "Failed to load rules"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createFraudRule(formData);
      // Clear form
      setFormData({
        rule_name:        "",
        rule_description: "",
        action:           "",
        risk_level:       "",
        precedence:       "",
      });
      loadRules();
    } catch (err) {
      alert(err.message || "Failed to create rule");
    } finally {
      setSubmitting(false);
    }
  };

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
        <Button variant="outlined" onClick={loadRules}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Manage Fraud Rules
      </Typography>

      {/* ─── Add New Rule Form ───────────────────────────────────── */}
      <Paper elevation={3} sx={{ p: 3, mb: 5, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Add New Rule
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Rule Name"
            name="rule_name"
            value={formData.rule_name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Description"
            name="rule_description"
            value={formData.rule_description}
            onChange={handleChange}
            multiline
            rows={3}
            required
          />
          <TextField
            label="Action"
            name="action"
            value={formData.action}
            onChange={handleChange}
            select
            required
          >
            <MenuItem value="block">Block</MenuItem>
            <MenuItem value="restrict">Restrict</MenuItem>
            <MenuItem value="limit">Limit</MenuItem>
          </TextField>
          <TextField
            label="Risk Level"
            name="risk_level"
            value={formData.risk_level}
            onChange={handleChange}
            select
            required
          >
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>
          <TextField
            label="Precedence"
            name="precedence"
            type="number"
            value={formData.precedence}
            onChange={handleChange}
            required
            InputProps={{ inputProps: { min: 1 } }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create Rule"}
          </Button>
        </Box>
      </Paper>

      {/* ─── Existing Rules Table ────────────────────────────────── */}
      {rules.length === 0 ? (
        <Box textAlign="center" mt={4}>
          <Typography>No fraud rules defined yet.</Typography>
          <Button variant="outlined" onClick={loadRules} sx={{ mt: 2 }}>
            Refresh
          </Button>
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Existing Rules
            </Typography>
            <Button size="small" onClick={loadRules}>
              Refresh
            </Button>
          </Box>
          <TableContainer component={Paper} aria-label="Fraud rules">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                  <TableCell><strong>Risk</strong></TableCell>
                  <TableCell><strong>Precedence</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.rule_id}>
                    <TableCell>{rule.rule_id}</TableCell>
                    <TableCell>{rule.rule_name}</TableCell>
                    <TableCell>{rule.rule_description}</TableCell>
                    <TableCell>{rule.action.toUpperCase()}</TableCell>
                    <TableCell>
                      {rule.risk_level === "high"   ? "🔥 High" :
                       rule.risk_level === "medium" ? "⚠️ Medium" :
                                                      "✅ Low"}
                    </TableCell>
                    <TableCell>{rule.precedence}</TableCell>
                    <TableCell>{rule.active ? "Active" : "Inactive"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
