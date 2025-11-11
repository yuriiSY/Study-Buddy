import React from "react";
import { useParams } from "react-router-dom";
import CustomPdfViewer from "../components/CustomPdfViewer";

export default function TestPage() {
  // ✅ Get fileId from URL (e.g. /pdf/123)
  const { fileId } = useParams();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#fafafa",
        padding: "40px 0",
      }}
    >
      {/* Page Title */}
      <h1 style={{ marginBottom: "20px" }}>PDF Viewer</h1>

      {/* Viewer Block */}
      <div
        style={{
          width: "90%",
          maxWidth: "1000px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <CustomPdfViewer
          fileId={fileId}
          fileName={`File ${fileId}`}
          height="80vh"
        />
      </div>
    </div>
  );
}
