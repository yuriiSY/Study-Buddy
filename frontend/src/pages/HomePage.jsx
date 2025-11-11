import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import Header from "../components/Header/Header";
import ModuleCard from "../components/ModuleCard/ModuleCard";
import Onboarding from "../components/Onboarding/Onboarding";
import ModuleModal from "../components/ModuleModal/ModuleModal";
import styles from "./HomePage.module.css";
import api from "../../src/api/axios";
import AddCard from "../components/AddCard/AddCard";
import StatsCards from "../components/StatsCards/StatsCards";
import ManageModuleModal from "../components/ManageModuleModal/ManageModuleModal";
import LoaderOverlay from "../components/LoaderOverlay/LoaderOverlay";

export const HomePage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manageModal, setManageModal] = useState({
    open: false,
    moduleId: null,
    title: "",
  });
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllArchived, setShowAllArchived] = useState(false);
  const [viewMode, setViewMode] = useState("active"); // ✅ "active" | "archived"

  // Fetch modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await api.get("/files/modules");
        setModules(res.data.modules || []);
      } catch (err) {
        console.error("Failed to fetch modules:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  // Handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateModule = (newModule) => {
    setModules((prev) => [...prev, newModule]);
    setIsModalOpen(false);
  };

  const handleArchive = async (id, archived) => {
    try {
      const endpoint = archived
        ? `/files/modules/${id}/unarchive`
        : `/files/modules/${id}/archive`;
      await api.put(endpoint);
      setModules((prev) =>
        prev.map((mod) =>
          mod.id === id ? { ...mod, archived: !archived } : mod
        )
      );
    } catch (error) {
      console.error("Failed to toggle archive:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this module and all its files?"
    );
    if (!confirmed) return;
    try {
      await api.delete(`/files/modules/${id}`);
      setModules((prev) => prev.filter((mod) => mod.id !== id));
    } catch (error) {
      console.error("Failed to delete module:", error);
    }
  };

  const handleManage = (id, title) => {
    setManageModal({ open: true, moduleId: id, title });
  };

  const handleUpdateModule = (updatedModule) => {
    setModules((prev) =>
      prev.map((m) => (m.id === updatedModule.id ? updatedModule : m))
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <Layout>
          <div className={styles.homePage}>
            <LoaderOverlay />
          </div>
        </Layout>
      </>
    );
  }

  const activeModules = modules.filter((m) => !m.archived);
  const archivedModules = modules.filter((m) => m.archived);

  return (
    <>
      <Header />
      <Layout>
        <div className={styles.homePage}>
          {modules.length === 0 ? (
            <Onboarding onClick={handleOpenModal} />
          ) : (
            <div className={styles.content}>
              <div className={styles.modulesSection}>
                {/* Header Controls */}
                <div className={styles.headerSection}>
                  <h2>Your Study Modules</h2>

                  {viewMode === "active" && (
                    <div>
                      {activeModules.length >= 3 && (
                        <button
                          className={styles.viewAllBtn}
                          onClick={handleOpenModal}
                        >
                          Add more modules
                        </button>
                      )}
                      {activeModules.length > 4 && (
                        <button
                          className={styles.viewAllBtn}
                          onClick={() => setShowAllActive((prev) => !prev)}
                        >
                          {showAllActive ? "View less" : "View all"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className={styles.toggleButtons}>
                  <button
                    className={viewMode === "active" ? styles.activeBtn : ""}
                    onClick={() => setViewMode("active")}
                  >
                    Current
                  </button>
                  <button
                    className={viewMode === "archived" ? styles.activeBtn : ""}
                    onClick={() => setViewMode("archived")}
                  >
                    Archive
                  </button>
                </div>
                {/* Active or Archived Modules */}
                <div className={styles.modulesGrid}>
                  {viewMode === "active"
                    ? (showAllActive
                        ? activeModules
                        : activeModules.slice(0, 4)
                      ).map((mod) => (
                        <ModuleCard
                          key={mod.id}
                          id={mod.id}
                          title={mod.title}
                          date={new Date(mod.createdAt).toLocaleDateString()}
                          archived={mod.archived}
                          onArchive={handleArchive}
                          onDelete={handleDelete}
                          onManage={handleManage}
                        />
                      ))
                    : (showAllArchived
                        ? archivedModules
                        : archivedModules.slice(0, 4)
                      ).map((mod) => (
                        <ModuleCard
                          key={mod.id}
                          id={mod.id}
                          title={mod.title}
                          date={new Date(mod.createdAt).toLocaleDateString()}
                          archived={mod.archived}
                          onArchive={handleArchive}
                          onDelete={handleDelete}
                          onManage={handleManage}
                        />
                      ))}

                  {/* Add Card (only in active view) */}
                  {viewMode === "active" && activeModules.length <= 3 && (
                    <AddCard onClick={handleOpenModal} />
                  )}
                </div>
              </div>

              {/* <StatsCards /> */}
            </div>
          )}
        </div>

        {/* Modals */}
        {isModalOpen && (
          <ModuleModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onCreate={handleCreateModule}
          />
        )}

        {manageModal.open && (
          <ManageModuleModal
            isOpen={manageModal.open}
            onClose={() =>
              setManageModal({ open: false, moduleId: null, title: "" })
            }
            moduleId={manageModal.moduleId}
            moduleTitle={manageModal.title}
            onUpdate={handleUpdateModule}
          />
        )}
      </Layout>
    </>
  );
};

export default HomePage;
