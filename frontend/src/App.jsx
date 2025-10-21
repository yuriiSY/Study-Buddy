import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { UploadeMaterialsPage } from "./pages/UploadMaterials/UploadeMaterialsPage";
import { StudySpacePage } from "./pages/StudySpacePage/StudySpacePage";
import { CreateStudySpacePage } from "./pages/CreateStudySpacePage/CreateStudySpacePage";
import { TestPage } from "./pages/TestPage/TestPage";
import { FlashcardPage } from "./pages/FlashcardPage/FlashcardPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/materials" element={<CreateStudySpacePage />} />
        <Route
          path="/selfassesment"
          element={<CreateStudySpacePage type="selfassesment" />}
        />
        <Route
          path="/smartrevision"
          element={<CreateStudySpacePage type="smartrevision" />}
        />
        <Route path="/upload" element={<UploadeMaterialsPage />} />
        <Route path="/studyspace/:id" element={<StudySpacePage />} />
        <Route path="/selfassesment/:id" element={<TestPage />} />
        <Route path="/smartrevision/:id" element={<FlashcardPage />} />
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
