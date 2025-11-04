// src/pages/ViewerPage.jsx
import React from "react";
import CustomPdfViewer from "../components/CustomPdfViewer";

export default function TestPage() {
  return (
    <div className="h-screen">
      <CustomPdfViewer fileUrl="/asd.pdf" />
    </div>
  );
}
