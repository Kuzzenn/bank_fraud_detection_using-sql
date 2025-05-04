// src/pages/TransferPage.jsx

import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { transfer } from "../api/service";

export default function TransferPage() {
  const [form, setForm]         = useState({
    source_id: "",
    dest_id:   "",
    amount:    "",
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const isFormValid = 
    form.source_id.trim() !== "" &&
    form.dest_id.trim()   !== "" &&
    form.amount.trim()    !== "" &&
    !isNaN(Number(form.source_id)) &&
    !isNaN(Number(form.dest_id)) &&
    Number(form.amount) > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");
    setSuccess("");

    const source_id = parseInt(form.source_id, 10);
    const dest_id   = parseInt(form.dest_id, 10);
    const amount    = parseFloat(form.amount);

    try {
      await transfer(source_id, dest_id, amount);
      setSuccess(`$${amount.toFixed(2)} transferred from #${source_id} to #${dest_id}`);
      setForm({ source_id: "", dest_id: "", amount: "" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4} mx="auto" maxWidth={400}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Transfer Funds
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="From Account ID"
            name="source_id"
            type="number"
            fullWidth
            margin="normal"
            required
            value={form.source_id}
            onChange={handleChange}
          />
          <TextField
            label="To Account ID"
            name="dest_id"
            type="number"
            fullWidth
            margin="normal"
            required
            value={form.dest_id}
            onChange={handleChange}
          />
          <TextField
            label="Amount"
            name="amount"
            type="number"
            fullWidth
            margin="normal"
            required
            inputProps={{ min: 0.01, step: 0.01 }}
            value={form.amount}
            onChange={handleChange}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!isFormValid || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Send Money"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
