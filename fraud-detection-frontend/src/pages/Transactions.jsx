// src/pages/Transactions.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Button,
} from "@mui/material";
import { fetchTransactions } from "../api/service";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const loadTransactions = () => {
    setLoading(true);
    setError(null);
    fetchTransactions()
      .then((data) => setTransactions(data))
      .catch((err) => setError(err.message || "Failed to load transactions"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTransactions();
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
        <Button variant="outlined" onClick={loadTransactions}>
          Retry
        </Button>
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography>No transactions found.</Typography>
        <Button variant="outlined" onClick={loadTransactions} sx={{ mt: 2 }}>
          Refresh
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Transactions
        </Typography>
        <Button onClick={loadTransactions}>Refresh</Button>
      </Box>

      <TableContainer component={Paper} aria-label="Transactions table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Transaction ID</strong></TableCell>
              <TableCell><strong>Account ID</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Details</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.transaction_id}>
                <TableCell>{tx.transaction_id}</TableCell>
                <TableCell>{tx.account_id}</TableCell>
                <TableCell>{tx.transaction_type}</TableCell>
                <TableCell>${Number(tx.amount).toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(tx.transaction_time).toLocaleString()}
                </TableCell>
                <TableCell>{tx.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
