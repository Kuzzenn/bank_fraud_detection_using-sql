import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout    from "./layouts/AdminLayout";
import UserLayout     from "./layouts/UserLayout";

import Signup from "./pages/Signup";
import Login  from "./pages/Login";

import Dashboard        from "./pages/Dashboard";
import UsersPage        from "./pages/Users";
import AdminFraudLogs   from "./pages/FraudLogs";
import ManageFraudRules from "./pages/ManageFraudRules";

import AccountsPage     from "./pages/AccountsPage";
import UserTransactions from "./pages/Transactions";
import TransferPage     from "./pages/TransferPage";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login"  element={<Login  />} />

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="users"       element={<UsersPage />} />
        <Route path="fraud-logs"  element={<AdminFraudLogs />} />
        <Route path="fraud-rules" element={<ManageFraudRules />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* User */}
      <Route
        path="/user/*"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="accounts"     element={<AccountsPage />} />
        <Route path="transactions" element={<UserTransactions />} />
        <Route path="transfer"     element={<TransferPage />} />
        <Route index element={<Navigate to="accounts" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
