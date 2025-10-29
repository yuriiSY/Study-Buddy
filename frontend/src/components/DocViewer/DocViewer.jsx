import React, { useState, useEffect } from "react";
import styles from "./DocViewer.module.css";
import { getFileHtml } from "../../api/filesApi";

export default function DocxViewer({ moduleId, fileId }) {
  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  const pageWidth = 800;
  const pageHeight = 1050;
  const pagePadding = 28;

  useEffect(() => {
    if (!fileId) return;

    const savedFile = localStorage.getItem("latestFileId");
    const savedPage = parseInt(localStorage.getItem("latestPageIndex"), 10);

    if (savedFile === String(fileId) && !isNaN(savedPage)) {
      setPageIndex(savedPage);
    } else {
      setPageIndex(0);
    }

    viewFile();
  }, [fileId]);

  useEffect(() => {
    localStorage.setItem("latestPageIndex", pageIndex);
  }, [pageIndex]);

  const viewFile = async () => {
    try {
      const html = await getFileHtml(moduleId, fileId);
      paginateHtml(html);
      localStorage.setItem("latestFileId", fileId);
    } catch (err) {
      console.error(err);
      alert("Failed to load file");
    }
  };

  async function paginateHtml(htmlString) {
    const container = document.createElement("div");
    container.style.width = `${pageWidth - pagePadding * 2}px`;
    container.style.visibility = "hidden";
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.innerHTML = htmlString;
    document.body.appendChild(container);

    const images = container.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve();
            else img.onload = img.onerror = resolve;
          })
      )
    );

    const pagesAcc = [];

    while (container.childNodes.length > 0) {
      const pageEl = document.createElement("div");
      pageEl.style.boxSizing = "border-box";
      pageEl.style.width = `${pageWidth - pagePadding * 2}px`;

      while (container.childNodes.length > 0) {
        const node = container.childNodes[0];
        pageEl.appendChild(node.cloneNode(true));
        container.removeChild(node);

        document.body.appendChild(pageEl);
        const height = pageEl.getBoundingClientRect().height;
        document.body.removeChild(pageEl);

        if (height > pageHeight - pagePadding * 2) {
          const last = pageEl.lastChild;
          pageEl.removeChild(last);
          container.insertBefore(last, container.firstChild);
          break;
        }
      }

      pagesAcc.push(pageEl.innerHTML);

      if (container.childNodes.length === 0) break;
    }

    document.body.removeChild(container);
    setPages(pagesAcc);
    setPageIndex((prev) => (prev >= pagesAcc.length ? 0 : prev));
  }

  return (
    <div className={styles.wrapper}>
      {pages.length > 0 && (
        <div className={styles.pageContainer}>
          <div className={styles.viewerArea}>
            <div className={styles.pageWrapper}>
              <div
                className={styles.page}
                style={{ width: pageWidth, height: pageHeight }}
              >
                <div
                  className={styles.pageContent}
                  dangerouslySetInnerHTML={{ __html: pages[pageIndex] }}
                />
              </div>
            </div>
            <div className={styles.controls}>
              <button
                onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                disabled={pageIndex === 0}
              >
                ⬅ Previous
              </button>
              <span>
                Page {pageIndex + 1} / {pages.length}
              </span>
              <button
                onClick={() =>
                  setPageIndex((i) => Math.min(pages.length - 1, i + 1))
                }
                disabled={pageIndex === pages.length - 1}
              >
                Next ➡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
