import React from "react";
import { Route, Routes } from "react-router-dom";
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
          path="/welcome"
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
        <Route
          path="/test/:fileId"
          element={
            <PrivateRoute>
              <TestPage />
            </PrivateRoute>
          }
        />
        {/* Private routes */}
        <Route
          path="/"
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
