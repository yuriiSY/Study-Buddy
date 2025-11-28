import React, { useState } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import ModuleModal from "../ModuleModal/ModuleModal";
import styles from "./WorkspaceLayout.module.css";

const WorkspaceLayout = ({
  children,
  modules = [],
  onFeatureSelect,
  selectedModuleId,
  onFilesAdded,
  hasSidebar = true,
  hideSearch = false,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleUploadClose = () => setIsUploadOpen(false);

  const handleFilesAdded = (updatedModule) => {
    if (onFilesAdded) onFilesAdded(updatedModule);
    setIsUploadOpen(false);
  };

  return (
    <div
      className={`${styles.workspace} ${
        isSidebarOpen ? styles.sidebarOpen : ""
      }`}
    >
      <Header
        onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
        hasSidebar={hasSidebar}
        hideSearch={hideSearch}
      />

      <div className={styles.layoutWrapper}>
        {hasSidebar && (
          <Sidebar
            modules={modules}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onFeatureSelect={onFeatureSelect}
            onAddFile={() => setIsUploadOpen(true)}
          />
        )}

        <main className={hasSidebar ? styles.main : styles.mainNoSidebar}>{children}</main>

        <ModuleModal
          isOpen={isUploadOpen}
          onClose={handleUploadClose}
          moduleId={selectedModuleId}
          onCreate={handleFilesAdded}
          mode="upload"
        />
      </div>
    </div>
  );
};

export default WorkspaceLayout;
