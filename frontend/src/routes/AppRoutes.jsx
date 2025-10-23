import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}