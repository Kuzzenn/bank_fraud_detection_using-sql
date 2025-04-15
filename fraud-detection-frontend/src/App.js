// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;



import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Transactions from "./pages/Transactions";
import FraudLogs from "./pages/FraudLogs";
// Additional page like Accounts or FraudRules can be added similarly

const App = () => {
  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: "240px" }}>
          <Navbar />
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/fraud-logs" element={<FraudLogs />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;

