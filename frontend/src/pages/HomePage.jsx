import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import Header from "../components/Header/Header";
import ModuleCard from "../components/ModuleCard/ModuleCard";
import Onboarding from "../components/Onboarding/Onboarding";
import ModuleModal from "../components/ModuleModal/ModuleModal";
import AddCard from "../components/AddCard/AddCard";
import StatsCards from "../components/StatsCards/StatsCards";
import ManageModuleModal from "../components/ManageModuleModal/ManageModuleModal";
import LoaderOverlay from "../components/LoaderOverlay/LoaderOverlay";
import styles from "./HomePage.module.css";

// ⬇️ Adjust this path if your api file lives somewhere else
import api from "../api/axios";

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
  const [viewMode, setViewMode] = useState("active"); // "active" | "archived"

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
              {/* Page header */}
              <header className={styles.pageHeader}>
                <div>
                  <h1 className={styles.pageTitle}>Your study space</h1>
                  <p className={styles.pageSubtitle}>
                    Pick a module to jump back in, or start something new.
                  </p>
                </div>
                <button
                  className={styles.primaryAction}
                  onClick={handleOpenModal}
                >
                  + New module
                </button>
              </header>

              {/* Main layout: modules + progress */}
              <main className={styles.mainLayout}>
                {/* Modules */}
                <section
                  className={styles.modulesSection}
                  aria-label="Study modules"
                >
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Your study modules</h2>

                    {viewMode === "active" && activeModules.length > 0 && (
                      <div className={styles.sectionActions}>
                        {activeModules.length >= 3 && (
                          <button
                            type="button"
                            className={styles.ghostButton}
                            onClick={handleOpenModal}
                          >
                            Add module
                          </button>
                        )}
                        {activeModules.length > 4 && (
                          <button
                            type="button"
                            className={styles.ghostButton}
                            onClick={() =>
                              setShowAllActive((prev) => !prev)
                            }
                          >
                            {showAllActive ? "View less" : "View all"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Toggle */}
                  <div className={styles.toggleButtons} role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={viewMode === "active"}
                      className={`${styles.toggleButton} ${
                        viewMode === "active"
                          ? styles.toggleButtonActive
                          : ""
                      }`}
                      onClick={() => setViewMode("active")}
                    >
                      Current
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={viewMode === "archived"}
                      className={`${styles.toggleButton} ${
                        viewMode === "archived"
                          ? styles.toggleButtonActive
                          : ""
                      }`}
                      onClick={() => setViewMode("archived")}
                    >
                      Archive
                    </button>
                  </div>

                  {/* Modules grid */}
                  <div className={styles.modulesGrid}>
                    {viewMode === "active" &&
                      (showAllActive
                        ? activeModules
                        : activeModules.slice(0, 4)
                      ).map((mod) => (
                        <ModuleCard
						  key={mod.id}
						  id={mod.id}
						  title={mod.title}
						  date={new Date(mod.createdAt).toLocaleDateString()}
						  coverImage={mod.coverImage || mod.cover_image}   // 👈 add this
						  archived={mod.archived}
						  onArchive={handleArchive}
						  onDelete={handleDelete}
						  onManage={handleManage}
						/>

                      ))}

                    {viewMode === "archived" &&
                      (showAllArchived
                        ? archivedModules
                        : archivedModules.slice(0, 4)
                      ).map((mod) => (
                        <ModuleCard
						  key={mod.id}
						  id={mod.id}
						  title={mod.title}
						  date={new Date(mod.createdAt).toLocaleDateString()}
						  coverImage={mod.coverImage || mod.cover_image}   // 👈 add this
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

                    {/* Empty states */}
                    {viewMode === "active" && activeModules.length === 0 && (
                      <p className={styles.emptyState}>
                        You don’t have any active modules yet. Create one to get
                        started.
                      </p>
                    )}

                    {viewMode === "archived" &&
                      archivedModules.length === 0 && (
                        <p className={styles.emptyState}>
                          No modules in your archive yet.
                        </p>
                      )}
                  </div>
                </section>

                {/* Progress / stats */}
                <section
                  className={styles.progressSection}
                  aria-label="Study progress"
                >
                  <StatsCards />
                </section>
              </main>
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
