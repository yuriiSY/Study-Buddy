import React, { useState } from "react";
import { Route, Routes } from 'react-router-dom';
// import { AuthModal } from "./components/AuthModal";
// import { Button } from "./components/Button";
// import MainMenu from "./components/MainMenu/MainMenu";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage/LoginPage";


export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="h-screen flex items-center justify-center">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>

      {/* <MainMenu />
      <Button onClick={() => setIsOpen(true)}>Open Auth Modal</Button>
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} /> */}
    </div>
  );
}
