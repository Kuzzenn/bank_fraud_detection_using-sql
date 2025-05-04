import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { fetchFraudLogs, updateFraudAction } from "../api/service";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FraudLogs() {
  const [logs, setLogs]       = useState(null);
  const [error, setError]     = useState(null);
  const [actions, setActions] = useState({});

  // 1) Load & sort logs
  const loadFraudLogs = async () => {
    setLogs(null);
    setError(null);
    try {
      const data = await fetchFraudLogs();
      data.sort((a, b) => {
        // primary: account_id ascending
        if (a.account_id !== b.account_id) {
          return a.account_id - b.account_id;
        }
        // secondary: newest transaction_time first
        return new Date(b.transaction_time) - new Date(a.transaction_time);
      });
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch fraud logs.");
      setLogs([]); 
    }
  };

  useEffect(() => {
    loadFraudLogs();
  }, []);

  const handleActionChange = (logId, value) => {
    setActions(prev => ({ ...prev, [logId]: value }));
  };

  // 2) Apply action & remove all logs for that account
  const handleApplyAction = async (log) => {
    const newStatus = actions[log.log_id];
    if (!newStatus) {
      return toast.error("Please select an action first.");
    }

    try {
      await updateFraudAction({
        log_id:      log.log_id,
        account_id:  log.account_id,
        new_status:  newStatus,
      });
      toast.success("Action applied successfully!");
      // Remove every log for this account
      setLogs(prev => prev.filter(l => l.account_id !== log.account_id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply action.");
    }
  };

  // Loading state
  if (logs === null) {
    return (
      <Box textAlign="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="outlined" onClick={loadFraudLogs}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Fraudulent Transactions
        </Typography>
        <Button onClick={loadFraudLogs}>Refresh</Button>
      </Box>

      <TableContainer component={Paper} aria-label="Fraud logs table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Log ID</TableCell>
              <TableCell>Account ID</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Detected Rule</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>New Action</TableCell>
              <TableCell>Apply</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No pending fraud incidents.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.log_id}>
                  <TableCell>{log.log_id}</TableCell>
                  <TableCell>{log.account_id}</TableCell>
                  <TableCell>{log.transaction_id}</TableCell>
                  <TableCell>{log.detected_rule}</TableCell>
                  <TableCell>${Number(log.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(log.transaction_time).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell>
                    <Select
                      value={actions[log.log_id] || ""}
                      onChange={(e) =>
                        handleActionChange(log.log_id, e.target.value)
                      }
                      displayEmpty
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="">
                        <em>Select</em>
                      </MenuItem>
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ToastContainer position="bottom-right" />
    </Box>
  );
}
