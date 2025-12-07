import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { StudySpacePage } from "./pages/StudySpace/StudySpacePage";
import { WelcomePage } from "./pages/WelcomePage/WelcomePage";
import { ToastContainer } from "react-toastify";
import TestPage from "./pages/TestPage";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <WelcomePage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <LoginPage isRegister />
            </PublicRoute>
          }
        />

        {/* Private routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/modules/:moduleId"
          element={
            <PrivateRoute>
              <StudySpacePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/test/:fileId"
          element={
            <PrivateRoute>
              <TestPage />
            </PrivateRoute>
          }
        />

        {/* Catch-all: any unknown URL -> go to "/" */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
