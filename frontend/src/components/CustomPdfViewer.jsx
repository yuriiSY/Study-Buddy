import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import styles from "./CustomPdfViewer.module.css";
import { getFileUrl } from "../api/filesApi";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CustomPdfViewer({
  fileId,
  fileName = "PDF Document",
  height = "700px", // 👈 smaller block
}) {
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.6);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("1");
  const containerRef = useRef();

  const isMobile = window.innerWidth <= 768;

  // ✅ Fetch signed S3 URL from backend
  useEffect(() => {
    if (!fileId) return;
    const fetchFileUrl = async () => {
      try {
        const data = await getFileUrl(fileId);
        console.log("Fetched file URL:", data);
        setFileUrl(data.url);
      } catch (err) {
        console.error("Error fetching PDF file:", err);
      }
    };
    fetchFileUrl();
  }, [fileId]);

  // ✅ Auto-scale with container width
  // useEffect(() => {
  //   const updateScale = () => {
  //     if (containerRef.current) {
  //       const width = containerRef.current.offsetWidth;
  //       setScale(Math.min(width / 600, 2)); // dynamic zoom
  //     }
  //   };
  //   updateScale();
  //   window.addEventListener("resize", updateScale);
  //   return () => window.removeEventListener("resize", updateScale);
  // }, []);

  // 📱💻 Auto-scale for mobile & desktop
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;

      if (width <= 480) {
        setScale(width / 300); // mobile
      } else {
        setScale(width / 600); // desktop
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // ✅ On PDF loaded
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setInputPage("1");
  };

  // ✅ Detect visible page on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !numPages) return;

    const handleScroll = () => {
      const pages = Array.from(
        container.querySelectorAll(`.${styles.pdfPage}`)
      );
      const scrollTop = container.scrollTop;
      const containerCenter = scrollTop + container.clientHeight / 2;

      let visiblePage = 1;
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const top = page.offsetTop;
        const bottom = top + page.offsetHeight;
        if (containerCenter >= top && containerCenter < bottom) {
          visiblePage = i + 1;
          break;
        }
      }
      setCurrentPage(visiblePage);
      setInputPage(String(visiblePage));
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [numPages]);

  // ✅ Jump to specific page via input
  const handlePageInputChange = (e) => setInputPage(e.target.value);
  const handlePageInputSubmit = (e) => {
    if (e.key === "Enter" && containerRef.current) {
      const pageNum = parseInt(inputPage, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
        const target = containerRef.current.querySelector(
          `.${styles.pdfPage}:nth-child(${pageNum})`
        );
        if (target) {
          containerRef.current.scrollTo({
            top: target.offsetTop - 10,
            behavior: "smooth",
          });
        }
      } else {
        setInputPage(String(currentPage));
      }
    }
  };

  return (
    <div className={styles.viewerWrapper}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.fileName}>{fileName}</span>
      </div>

      {/* PDF Scroll Block */}
      <div
        className={styles.pdfContainer}
        style={{ height }}
        ref={containerRef}
      >
        {!fileUrl ? (
          <div className={styles.loading}>Loading PDF...</div>
        ) : (
          <Document
            key={fileUrl}
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => console.error("PDF load error:", err)}
          >
            {Array.from(new Array(numPages), (_, i) => (
              <div key={i} className={styles.pdfPage}>
                <Page
                  pageNumber={i + 1}
                  scale={scale}
                  renderMode="canvas"
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  width={
                    isMobile ? containerRef.current?.offsetWidth : undefined
                  }
                />
              </div>
            ))}
          </Document>
        )}
      </div>

      {/* Footer */}
      {fileUrl && (
        <div className={styles.footer}>
          <div className={styles.footerContent}>
            <span>Page</span>
            <input
              type="number"
              min="1"
              max={numPages || 1}
              value={inputPage}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputSubmit}
              className={styles.inlinePageInput}
            />
            <span>/ {numPages || "--"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
