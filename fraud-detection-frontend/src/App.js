import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";


import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Transactions from "./pages/Transactions";
import FraudLogs from "./pages/FraudLogs";
import AddFraudRule from "./pages/AddFraudRule"
import AccountsPage from "./pages/AccountsPage"



const App = () => {
  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
  component="main"
  sx={{
    flexGrow: 1,
    p: 3,
    marginLeft: { xs: 0, sm: "240px" }, // xs = mobile, sm+ = desktop
    marginTop: "64px"
  }}
>
<Box sx={{ mt: "64px", ml: { md: "250px" }, p: 2 }}>
  <Navbar />
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/users" element={<Users />} />
    <Route path="/transactions" element={<Transactions />} />
    <Route path="/fraud-logs" element={<FraudLogs />} />
    <Route path="/fraud-rules" element={<AddFraudRule />} />
    <Route path="/accounts" element={<AccountsPage />} />
    <Route path="/" element={<Navigate to="/dashboard" />} />
  </Routes>
</Box>
</Box>
      </Box>
    </Router>
  );
};

export default App;

