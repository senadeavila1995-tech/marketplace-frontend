import { Navigate } from "react-router-dom";
import { session } from "../services/session";
import React from "react";

interface Props {
  children: React.ReactNode;
  role?: "ADMIN" | "CUSTOMER" | "SELLER";
}

export default function ProtectedRoute({ children, role }: Props) {
  const token = session.getToken();
  const userRole = session.getRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}