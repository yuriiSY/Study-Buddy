import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { UploadeMaterialsPage } from "./pages/UploadMaterials/UploadeMaterialsPage";
import { StudySpacePage } from "./pages/StudySpacePage/StudySpacePage";

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/materials" element={<UploadeMaterialsPage />} />
        <Route path="/studyspace/:id" element={<StudySpacePage />} />
      </Routes>
    </div>
  );
}
