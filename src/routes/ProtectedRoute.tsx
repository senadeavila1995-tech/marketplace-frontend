import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { session } from "../services/session";
import type { UserRole } from "../types/User";

interface Props {
  children: ReactNode;
  roles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  roles,
}: Props) {
  const token = session.getToken();
  const role = session.getRole();

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    if (role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (role === "SELLER") {
      return <Navigate to="/seller" replace />;
    }

    if (role === "CUSTOMER") {
      return <Navigate to="/shop" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
