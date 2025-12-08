import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const isLoggedIn = useSelector(
    (state) => state.auth?.isLoggedIn ?? false
  );

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
