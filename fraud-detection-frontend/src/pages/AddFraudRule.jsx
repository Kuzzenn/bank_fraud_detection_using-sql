import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

const FraudRules = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    action: "",
    riskLevel: "",
    precedence: "",
    status: "Active",
  });

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRule({ ...newRule, [name]: value });
  };

  const handleAddRule = () => {
    setRules([...rules, { id: rules.length + 1, ...newRule }]);
    setNewRule({
      name: "",
      description: "",
      action: "",
      riskLevel: "",
      precedence: "",
      status: "Active",
    });
    handleDialogClose();
  };

  return (
    <div style={{ backgroundColor: "#121212", minHeight: "100vh", color: "#fff", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Manage Fraud Rules</h1>
      <TableContainer component={Paper} style={{ backgroundColor: "FEF3E2" }}>
        <Table>
          <TableHead style={{ backgroundColor: "#e0e0e0" }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Rule Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Risk Level</TableCell>
              <TableCell>Precedence</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No rules added yet.
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.id}</TableCell>
                  <TableCell>{rule.name}</TableCell>
                  <TableCell>{rule.description}</TableCell>
                  <TableCell>{rule.action}</TableCell>
                  <TableCell>{rule.riskLevel}</TableCell>
                  <TableCell>{rule.precedence}</TableCell>
                  <TableCell>{rule.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Fab
        color="primary"
        aria-label="add"
        style={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleDialogOpen}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle style={{ backgroundColor: "F5ECD5", color: "#fff" }}>
          Add New Rule
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "#f5f5f5" }}>
          <TextField
            fullWidth
            margin="dense"
            label="Rule Name"
            name="name"
            value={newRule.name}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Description"
            name="description"
            value={newRule.description}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Action"
            name="action"
            value={newRule.action}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Risk Level"
            name="riskLevel"
            value={newRule.riskLevel}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Precedence"
            name="precedence"
            type="number"
            value={newRule.precedence}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions style={{ backgroundColor: "#f5f5f5" }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAddRule} color="primary">
            Add Rule
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FraudRules;
