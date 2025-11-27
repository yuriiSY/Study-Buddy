import React from "react";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { StudySpacePage } from "./pages/StudySpace/StudySpacePage";
import { WelcomePage } from "./pages/WelcomePage/WelcomePage";
import { ToastContainer } from "react-toastify";
import TestPage from "./pages/TestPage";
import "react-toastify/dist/ReactToastify.css";

import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

export default function App() {
  return (
    <div>
      <Routes>
        {/* PUBLIC LANDING PAGE */}
        <Route path="/" element={<WelcomePage />} />

        {/* PUBLIC AUTH ROUTES */}
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

        {/* PROTECTED APP ROUTES */}
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
