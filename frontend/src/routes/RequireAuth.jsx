import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Wrap protected routes with <RequireAuth />.
 * Uses a simple token-from-localStorage check.
 * Replace with Redux or context if you already have auth state there.
 */
export default function RequireAuth() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}