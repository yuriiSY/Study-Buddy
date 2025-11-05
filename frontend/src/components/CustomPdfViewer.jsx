import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import styles from "./CustomPdfViewer.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CustomPdfViewer({ fileUrl = "/docs/sample.pdf" }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.6); // default zoom
  const containerRef = useRef();

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // Fit PDF proportionally (800 is default PDF width)
        setScale(Math.min(width / 600, 2)); // limit to 2x zoom
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  return (
    <div className={styles.viewerWrapper}>
      <div className={styles.pdfContainer} ref={containerRef}>
        <div className={styles.pdfDocument}>
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </div>

        <div className={styles.navigation}>
          <button
            onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
            disabled={pageNumber <= 1}
            className={`${styles.navButton} ${
              pageNumber <= 1 ? styles.disabled : ""
            }`}
          >
            ← Previous
          </button>
          <span className={styles.pageIndicator}>
            Page {pageNumber} / {numPages || "--"}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
            disabled={pageNumber >= numPages}
            className={`${styles.navButton} ${
              pageNumber >= numPages ? styles.disabled : ""
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
