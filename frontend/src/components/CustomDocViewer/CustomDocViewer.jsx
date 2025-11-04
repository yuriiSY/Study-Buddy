import React, { useRef, useMemo } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

export default function CustomPdfViewer() {
  const viewerRef = useRef(null);

  const docs = useMemo(
    () => [
      {
        uri: "/asd.pdf",
        fileType: "pdf",
        fileName: "sample.pdf",
      },
    ],
    []
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "40vh",
        width: "50%",
      }}
    >
      <div style={{ flex: 1, width: "80%" }}>
        <DocViewer
          ref={viewerRef}
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          style={{ width: "100%", height: "100%" }}
          config={{
            header: { disableHeader: true },
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
          background: "#f3f3f3",
          width: "80%",
          borderTop: "1px solid #ccc",
        }}
      >
        <button
          onClick={() => viewerRef.current?.prevPage?.()}
          className="custom-btn"
        >
          ⬅️ Previous
        </button>
        <button
          onClick={() => viewerRef.current?.nextPage?.()}
          className="custom-btn"
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
}
