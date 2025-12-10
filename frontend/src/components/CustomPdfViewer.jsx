import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import styles from "./CustomPdfViewer.module.css";
import { getFileUrl } from "../api/filesApi";
import { ZoomIn, ZoomOut, Upload, ChevronDown, BookMarked } from "lucide-react";
import api from "../api/axios";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CustomPdfViewer({
  fileId,
  fileName = "PDF Document",
  height = "700px",
  allFiles = [],
  selectedFileId,
  onFileSelect,
  onUploadMore,
  userId,
  onSelectTextAddNote,
}) {
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.6);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("1");
  const containerRef = useRef();
  const [selectedText, setSelectedText] = useState("");
  const [showAddBtn, setShowAddBtn] = useState(false);
  const [btnPosition, setBtnPosition] = useState({ x: 0, y: 0 });
  const viewerWrapperRef = useRef();

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

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text.length === 0) {
        setShowAddBtn(false);
        return;
      }
      
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) {
          setShowAddBtn(false);
          return;
        }

        setSelectedText(text);
        setBtnPosition({
          x: Math.max(10, rect.left + window.scrollX),
          y: rect.bottom + window.scrollY + 6,
        });

        setShowAddBtn(true);
      } catch (e) {
        setShowAddBtn(false);
      }
    };

    const pdfContainer = containerRef.current;
    if (pdfContainer) {
      pdfContainer.addEventListener("mouseup", handleSelection);
      pdfContainer.addEventListener("touchend", handleSelection);

      return () => {
        pdfContainer.removeEventListener("mouseup", handleSelection);
        pdfContainer.removeEventListener("touchend", handleSelection);
      };
    }
  }, []);

  const handleAddNote = async (text) => {
    try {
      const formattedText = `\n\n**Highlighted Text:**\n${text}`;

      await api.post("/notes/append", {
        userId,
        fileId,
        text: formattedText,
      });

      // Update TutorTabs notes
      onSelectTextAddNote(formattedText);

      // Hide floating UI
      setShowAddBtn(false);
    } catch (err) {
      console.error("Failed to append note", err);
    }
  };

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

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.6);
  };

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
    <div className={styles.viewerWrapper} ref={viewerWrapperRef}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.fileSelector}>
          {allFiles.length > 1 ? (
            <>
              <select
                value={selectedFileId || ""}
                onChange={(e) => {
                  const file = allFiles.find(
                    (f) => f.id === parseInt(e.target.value)
                  );
                  if (file && onFileSelect) {
                    onFileSelect(file);
                  }
                }}
                className={styles.fileDropdown}
              >
                {allFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.displayTitle}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={styles.dropdownChevron} />
            </>
          ) : (
            <span className={styles.fileName}>{fileName}</span>
          )}
        </div>

        <div className={styles.controls}>
          {onUploadMore && (
            <button
              onClick={onUploadMore}
              className={styles.uploadBtn}
              title="Upload more files"
            >
              <Upload size={16} />
            </button>
          )}
          <div className={styles.zoomControls}>
            <button
              onClick={handleZoomOut}
              className={styles.zoomBtn}
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className={styles.zoomBtn}
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleResetZoom}
              className={styles.resetBtn}
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Highlighting Hint */}
      <div className={styles.hint}>
        <span>💡 Tip: Highlight any text to add it to your notes</span>
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
                  renderTextLayer={true}
                  width={
                    isMobile ? containerRef.current?.offsetWidth : undefined
                  }
                />
              </div>
            ))}
          </Document>
        )}
      </div>

      {showAddBtn && (
        <button
          onClick={async () => {
            await handleAddNote(selectedText);
            setShowAddBtn(false);
          }}
          className={styles.addNoteFloating}
          style={{
            top: `${btnPosition.y}px`,
            left: `${btnPosition.x}px`,
          }}
        >
          <BookMarked size={14} />
          Add to Notes
        </button>
      )}

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
