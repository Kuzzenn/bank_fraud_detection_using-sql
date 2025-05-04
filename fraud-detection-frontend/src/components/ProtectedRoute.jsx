// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, role: neededRole }) {
  const { token, role } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (neededRole && role !== neededRole) {
    // redirect to their own home
    const home = role === "admin" ? "/admin/dashboard" : "/user/accounts";
    return <Navigate to={home} replace />;
  }
  return children;
}
