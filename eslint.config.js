import React from "react";
import { Navigate } from "react-router-dom";
import { session } from "../services/session";

interface Props {
  children: React.ReactNode;
  roles?: ("ADMIN" | "CUSTOMER" | "SELLER")[];
}

export default function ProtectedRoute({
  children,
  roles,
}: Props) {
  const token = session.getToken();
  const userRole = session.getRole();

  // No autenticado
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Validación de roles
  if (roles && !roles.includes(userRole as any)) {
    switch (userRole) {
      case "ADMIN":
        return <Navigate to="/" replace />;

      case "SELLER":
        return <Navigate to="/products" replace />;

      case "CUSTOMER":
        return <Navigate to="/shop" replace />;

      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}