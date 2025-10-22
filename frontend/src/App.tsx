import { BrowserRouter, Routes, Route } from "react-router-dom";
import AITestPad from "./pages/aiTest";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AITestPad />} />
      </Routes>
    </BrowserRouter>
  );
}