import React, { useEffect, useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Select, MenuItem, Chip, Box } from "@mui/material";
import { fetchFraudLogs, resolveFraud } from "../api/service";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = "http://127.0.0.1:5000/api"; // Make sure this matches

const FraudLogs = () => {
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState({});

  const loadFraudLogs = () => {
    fetchFraudLogs().then((data) => setLogs(data));
  };

  useEffect(() => {
    loadFraudLogs();
  }, []);

  const handleActionChange = (logId, value) => {
    setActions({
      ...actions,
      [logId]: value
    });
  };

  const handleApplyAction = async (log) => {
    const selectedAction = actions[log.log_id];
    if (!selectedAction) {
      toast.error("Please select an action first.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/update-fraud-action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          log_id: log.log_id,
          account_id: log.account_id,
          new_status: selectedAction
        })
      });

      if (response.ok) {
        toast.success("Action applied successfully!");
        loadFraudLogs();
      } else {
        toast.error("Failed to apply action.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error applying action.");
    }
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
              <TableCell>Current Status</TableCell>
              <TableCell>New Action</TableCell>
              <TableCell>Apply</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.log_id}>
                <TableCell>{log.log_id}</TableCell>
                <TableCell>{log.transaction_id}</TableCell>
                <TableCell>{log.detected_rule}</TableCell>
                <TableCell>${Number(log.amount).toFixed(2)}</TableCell>
                <TableCell>{new Date(log.transaction_time).toLocaleString()}</TableCell>
                <TableCell>{log.status}</TableCell>
                <TableCell>
                  <Select
                    value={actions[log.log_id] || ""}
                    onChange={(e) => handleActionChange(log.log_id, e.target.value)}
                    displayEmpty
                    size="small"
                  >
                    <MenuItem value=""><em>Select</em></MenuItem>
                    <MenuItem value="blocked">Block</MenuItem>
                    <MenuItem value="restricted">Restrict</MenuItem>
                    <MenuItem value="limited">Limit</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleApplyAction(log)}
                  >
                    Apply
                  </Button>
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
