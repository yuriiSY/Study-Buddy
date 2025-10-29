import React, { useState } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import styles from "./WorkspaceLayout.module.css";

const WorkspaceLayout = ({ children, modules = [], onFeatureSelect }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div
      className={`${styles.workspace} ${
        isSidebarOpen ? styles.sidebarOpen : ""
      }`}
    >
      <Header
        onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
        hasSidebar={true}
      />

      <div className={styles.layoutWrapper}>
        <Sidebar
          modules={modules}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onFeatureSelect={onFeatureSelect}
        />

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
