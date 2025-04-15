import React, { useEffect, useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from "@mui/material";
import { fetchFraudLogs, resolveFraud } from "../api/service";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const FraudLogs = () => {
  const [logs, setLogs] = useState([]);

  const loadFraudLogs = () => {
    fetchFraudLogs().then((data) => setLogs(data));
  };

  useEffect(() => {
    loadFraudLogs();
  }, []);

  const handleResolve = (logId) => {
    resolveFraud(logId)
      .then((res) => {
        toast.success("Incident marked as resolved");
        loadFraudLogs();
      })
      .catch((err) => {
        toast.error("Error updating incident");
      });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Fraudulent Transactions
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="fraud logs table">
          <TableHead>
            <TableRow>
              <TableCell>Log ID</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Detected Rule</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.log_id}>
                <TableCell>{log.log_id}</TableCell>
                <TableCell>{log.transaction_id}</TableCell>
                <TableCell>{log.detected_rule}</TableCell>
                <TableCell>${log.amount}</TableCell>
                <TableCell>{log.transaction_time}</TableCell>
                <TableCell>{log.status}</TableCell>
                <TableCell>
                  {log.status === "pending" && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleResolve(log.log_id)}
                    >
                      Resolve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ToastContainer />
    </div>
  );
};

export default FraudLogs;
