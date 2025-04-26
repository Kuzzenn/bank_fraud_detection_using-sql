import React, { useEffect, useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Box } from "@mui/material";
import { fetchAccounts } from "../api/service";

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);

  const loadAccounts = () => {
    fetchAccounts().then((data) => setAccounts(data));
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const getStatusChip = (status) => {
    switch (status) {
      case "blocked":
        return <Chip label="Blocked" color="error" />;
      case "restricted":
        return <Chip label="Restricted" color="warning" />;
      case "limited":
        return <Chip label="Limited" color="info" />;
      default:
        return <Chip label="Active" color="success" />;
    }
  };

  const getRiskChip = (risk) => {
    switch (risk) {
      case "high":
        return <Chip label="High Risk" color="error" />;
      case "medium":
        return <Chip label="Medium Risk" color="warning" />;
      case "low":
        return <Chip label="Low Risk" color="success" />;
      default:
        return <Chip label="-" />;
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Customer Accounts
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="accounts table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Account ID</strong></TableCell>
              <TableCell><strong>User ID</strong></TableCell>
              <TableCell><strong>Account Number</strong></TableCell>
              <TableCell><strong>Balance</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Risk Level</strong></TableCell>
              <TableCell><strong>Created At</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.account_id}>
                <TableCell>{account.account_id}</TableCell>
                <TableCell>{account.user_id}</TableCell>
                <TableCell>{account.account_number}</TableCell>
                <TableCell>${Number(account.balance).toFixed(2)}</TableCell>

                <TableCell>{getStatusChip(account.account_status)}</TableCell>
                <TableCell>{getRiskChip(account.risk_level)}</TableCell>
                <TableCell>{new Date(account.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AccountsPage;
