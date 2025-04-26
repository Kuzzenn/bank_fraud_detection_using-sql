import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, MenuItem, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { createFraudRule, fetchFraudRules } from "../api/service"; // Use your existing service methods

const ManageFraudRules = () => {
  const [formData, setFormData] = useState({
    rule_name: "",
    rule_description: "",
    action: "",
    risk_level: "",
    precedence: ""
  });

  const [rules, setRules] = useState([]);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await fetchFraudRules();
      setRules(data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch fraud rules.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFraudRule(formData);
      alert("Fraud Rule Created Successfully!");
      setFormData({
        rule_name: "",
        rule_description: "",
        action: "",
        risk_level: "",
        precedence: ""
      });
      loadRules(); // Reload the table after adding
    } catch (error) {
      console.error(error);
      alert("Failed to create rule. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Manage Fraud Rules
      </Typography>

      {/* Add Fraud Rule Form */}
      <Paper elevation={4} sx={{ padding: 3, mb: 5, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Add New Rule
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Rule Name"
            name="rule_name"
            value={formData.rule_name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Rule Description"
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
          <Button type="submit" variant="contained" size="large">
            Create Rule
          </Button>
        </Box>
      </Paper>

      {/* Existing Fraud Rules Table */}
      <Paper elevation={4} sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Existing Rules
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Rule Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Risk Level</strong></TableCell>
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
                    {rule.risk_level === "high" ? "🔥 High" :
                     rule.risk_level === "medium" ? "⚠️ Medium" :
                     "✅ Low"}
                  </TableCell>
                  <TableCell>{rule.precedence}</TableCell>
                  <TableCell>{rule.active ? "Active" : "Inactive"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
};

export default ManageFraudRules;
