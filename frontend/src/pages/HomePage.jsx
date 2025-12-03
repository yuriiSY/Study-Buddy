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
import TopDiscussions from "../components/TopDiscussions/TopDiscussions";
import StatsOverview from "../components/StatsOverview/StatsOverview";
import { FolderOpen, Archive, ChevronDown, ChevronUp } from "lucide-react";

export const HomePage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manageModal, setManageModal] = useState({
    open: false,
    moduleId: null,
    title: "",
    coverImage: null,
  });
  const [viewMode, setViewMode] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProgressCollapsed, setIsProgressCollapsed] = useState(() => {
    return window.innerWidth <= 768;
  });
  const [statsRefresh, setStatsRefresh] = useState(0);

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

  // Fetch modules
  useEffect(() => {
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

  const handleManage = (id, title, coverImage) => {
    setManageModal({ open: true, moduleId: id, title, coverImage });
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

  const sortByLastOpened = (mods) => {
    return [...mods].sort((a, b) => {
      const aTime = new Date(a.lastAccessedAt || a.createdAt).getTime();
      const bTime = new Date(b.lastAccessedAt || b.createdAt).getTime();
      return bTime - aTime;
    });
  };

  const sortedActiveModules = sortByLastOpened(activeModules);
  const sortedArchivedModules = sortByLastOpened(archivedModules);

  const filteredActive = sortedActiveModules.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArchived = sortedArchivedModules.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Layout>
        <div
          className={`${styles.homePage} ${
            isProgressCollapsed ? styles.progressCollapsed : ""
          }`}
        >
          {modules.length === 0 ? (
            <Onboarding onClick={handleOpenModal} />
          ) : (
            <div className={styles.content}>
              <div
                className={`${styles.progressSection} ${
                  isProgressCollapsed ? styles.collapsed : ""
                }`}
              >
                <div className={styles.progressHeader}>
                  <h3>Your Progress</h3>
                  <button
                    className={styles.collapseBtn}
                    onClick={() => setIsProgressCollapsed(!isProgressCollapsed)}
                    title={
                      isProgressCollapsed ? "Show progress" : "Hide progress"
                    }
                  >
                    {isProgressCollapsed ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronUp size={20} />
                    )}
                  </button>
                </div>
                {!isProgressCollapsed && (
                  <StatsOverview refresh={statsRefresh} />
                )}
              </div>
              <div className={styles.mainContent}>
                <div className={styles.modulesSection}>
                  {/* Header Controls */}
                  <div className={styles.headerSection}>
                    <h2>Modules</h2>
                    {viewMode === "active" && activeModules.length > 3 && (
                      <button
                        className={styles.viewAllBtn}
                        onClick={handleOpenModal}
                      >
                        Add more modules
                      </button>
                    )}
                  </div>
                  <div className={styles.toggleButtons}>
                    <button
                      className={
                        viewMode === "active"
                          ? styles.activeBtn
                          : styles.inactiveBtn
                      }
                      onClick={() => setViewMode("active")}
                    >
                      <FolderOpen size={18} />
                      <span>Current</span>
                    </button>

                    <button
                      className={
                        viewMode === "archived"
                          ? styles.activeBtn
                          : styles.inactiveBtn
                      }
                      onClick={() => setViewMode("archived")}
                    >
                      <Archive size={18} />
                      <span>Archive</span>
                    </button>
                  </div>
                  {/* Active or Archived Modules - Always show all with scrolling */}
                  {viewMode === "active" && filteredActive.length === 0 ? (
                    <div className={styles.emptyState}>
                      <FolderOpen size={48} />
                      <h3>
                        {searchQuery ? "No modules found" : "No Active Modules"}
                      </h3>
                      <p>
                        {searchQuery
                          ? "Try a different search term"
                          : "Create your first module to get started"}
                      </p>
                      {!searchQuery && (
                        <button
                          className={styles.emptyStateBtn}
                          onClick={handleOpenModal}
                        >
                          Create Module
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className={styles.modulesGrid}>
                      {viewMode === "active" &&
                        filteredActive.map((mod) => (
                          <ModuleCard
                            key={mod.id}
                            id={mod.id}
                            title={mod.title}
                            date={new Date(mod.createdAt).toLocaleDateString()}
                            archived={mod.archived}
                            onArchive={handleArchive}
                            onDelete={handleDelete}
                            onManage={handleManage}
                            coverImage={mod.coverImage}
                            isOwner={mod.isOwner}
                          />
                        ))}

                      {viewMode === "archived" &&
                        filteredArchived.map((mod) => (
                          <ModuleCard
                            key={mod.id}
                            id={mod.id}
                            title={mod.title}
                            date={new Date(mod.createdAt).toLocaleDateString()}
                            archived={mod.archived}
                            onArchive={handleArchive}
                            onDelete={handleDelete}
                            onManage={handleManage}
                            coverImage={mod.coverImage}
                            isOwner={mod.isOwner}
                          />
                        ))}

                      {viewMode === "active" && activeModules.length <= 3 && (
                        <AddCard onClick={handleOpenModal} />
                      )}
                    </div>
                  )}

                  {viewMode === "archived" && filteredArchived.length === 0 && (
                    <div className={styles.emptyState}>
                      <Archive size={48} />
                      <h3>
                        {searchQuery
                          ? "No modules found"
                          : "No Archived Modules"}
                      </h3>
                      <p>
                        {searchQuery
                          ? "Try a different search term"
                          : "Archive modules to organize your workspace"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* <div className={styles.sidebar}>
                <TopDiscussions />
              </div> */}
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
              setManageModal({ open: false, moduleId: null, title: "", coverImage: null })
            }
            moduleId={manageModal.moduleId}
            moduleTitle={manageModal.title}
            moduleCoverImage={manageModal.coverImage}
            onUpdate={handleUpdateModule}
            onRefresh={fetchModules}
            onStatsRefresh={() => setStatsRefresh((prev) => prev + 1)}
          />
        )}
      </Layout>
    </>
  );
};

export default HomePage;
