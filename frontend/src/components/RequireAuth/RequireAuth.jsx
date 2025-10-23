// src/components/RequireAuth.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../lib/auth";

export default function RequireAuth() {
  const token = getToken();
  const loc = useLocation();
  if (!token) {
    // bounce to /login but remember where we were going
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return <Outlet />;
}