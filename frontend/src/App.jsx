import React from "react";
import { Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { HomePage } from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import { UploadeMaterialsPage } from "./pages/UploadMaterials/UploadeMaterialsPage.jsx";
import { StudySpacePage } from "./pages/StudySpacePage/StudySpacePage.jsx";
import { CreateStudySpacePage } from "./pages/CreateStudySpacePage/CreateStudySpacePage.jsx";
import { TestPage } from "./pages/TestPage/TestPage.jsx";
import { FlashcardPage } from "./pages/FlashcardPage/FlashcardPage.jsx";
import { WelcomePage } from "./pages/WelcomePage/WelcomePage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";


function Ping() { return <div style={{padding:24}}>PING OK</div>; } //throwaway ping for testing

export default function App() {
  // const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="h-screen flex items-center justify-center">
      <Routes>
        <Route path="/ping" element={<Ping />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
