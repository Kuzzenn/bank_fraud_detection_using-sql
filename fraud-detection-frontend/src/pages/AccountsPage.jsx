// src/pages/AccountsPage.jsx
import React, { useEffect, useState, useContext } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  fetchUserAccounts,
  createUserAccount,
  deposit,
  withdraw,
} from "../api/service";
import { AuthContext } from "../contexts/AuthContext";

export default function AccountsPage() {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // dialog state
  const [mode, setMode]         = useState(null); // "deposit" | "withdraw"
  const [open, setOpen]         = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [amount, setAmount]     = useState("");

  const loadAccounts = () => {
    setLoading(true);
    fetchUserAccounts()
      .then(setAccounts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadAccounts, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Typography color="error" align="center" sx={{ mt: 4 }}>
        {error}
      </Typography>
    );
  }

  const handleNewAccount = async () => {
    try {
      await createUserAccount();
      loadAccounts();
    } catch {
      alert("Failed to create account");
    }
  };

  const openDialog = (acctId, m) => {
    setSelectedId(acctId);
    setMode(m);
    setAmount("");
    setOpen(true);
  };
  const closeDialog = () => setOpen(false);

  const handleConfirm = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      alert("Enter a valid amount");
      return;
    }
    try {
      if (mode === "deposit") {
        await deposit(selectedId, value);
      } else {
        await withdraw(selectedId, value);
      }
      closeDialog();
      loadAccounts();
    } catch {
      alert(`${mode === "deposit" ? "Deposit" : "Withdrawal"} failed`);
    }
  };

  // helper chips
  const getStatusChip = (s) => {
    switch (s) {
      case "blocked":    return <Chip label="Blocked" color="error" />;
      case "restricted": return <Chip label="Restricted" color="warning" />;
      case "limited":    return <Chip label="Limited" color="info" />;
      default:           return <Chip label="Active" color="success" />;
    }
  };
  const getRiskChip = (r) => {
    switch (r) {
      case "high":   return <Chip label="High Risk" color="error" />;
      case "medium": return <Chip label="Medium Risk" color="warning" />;
      case "low":    return <Chip label="Low Risk" color="success" />;
      default:       return <Chip label="—" />;
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          My Accounts
        </Typography>
        <Button variant="contained" onClick={handleNewAccount}>
          + New Account
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Number</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Risk</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((acct) => (
              <TableRow key={acct.account_id}>
                <TableCell>{acct.account_id}</TableCell>
                <TableCell>{acct.account_number}</TableCell>
                <TableCell>
                  ${Number(acct.balance).toFixed(2)}
                </TableCell>
                <TableCell>
                  {getStatusChip(acct.account_status)}
                </TableCell>
                <TableCell>{getRiskChip(acct.risk_level)}</TableCell>
                <TableCell>
                  {new Date(acct.created_at).toLocaleString()}
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    onClick={() => openDialog(acct.account_id, "deposit")}
                  >
                    Deposit
                  </Button>
                  <Button
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => openDialog(acct.account_id, "withdraw")}
                  >
                    Withdraw
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Deposit/Withdraw Dialog */}
      <Dialog open={open} onClose={closeDialog}>
        <DialogTitle>
          {mode === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained">
            {mode === "deposit" ? "Deposit" : "Withdraw"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
