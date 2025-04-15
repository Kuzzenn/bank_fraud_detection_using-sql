import React, { useEffect, useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { fetchTransactions } from "../api/service";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions().then((data) => setTransactions(data));
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="transactions table">
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Account ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.transaction_id}>
                <TableCell>{tx.transaction_id}</TableCell>
                <TableCell>{tx.account_id}</TableCell>
                <TableCell>{tx.transaction_type}</TableCell>
                <TableCell>${tx.amount}</TableCell>
                <TableCell>{tx.transaction_time}</TableCell>
                <TableCell>{tx.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Transactions;
