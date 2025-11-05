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

export const HomePage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateModule = (newModule) => {
    setModules((prev) => [...prev, newModule]);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Layout>
          <div className={styles.homePage}>
            <p>Loading...</p>
          </div>
        </Layout>
      </>
    );
  }

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
                <h2>Your Study Modules</h2>
                <div className={styles.modulesGrid}>
                  {modules.map((mod) => (
                    <ModuleCard
                      key={mod.id}
                      id={mod.id}
                      title={mod.title}
                      date={new Date(mod.createdAt).toLocaleDateString()}
                    />
                  ))}
                  <AddCard onClick={handleOpenModal} />
                </div>
              </div>
              <div className={styles.modulesSection}>
                <h2>Archived modules</h2>
                <div className={styles.modulesGrid}>
                  <ModuleCard
                    key={"1000"}
                    id={"1000"}
                    title={"Mats"}
                    date={new Date("2025-01-10T10:30:00Z").toLocaleDateString()}
                  />
                </div>
              </div>
              <StatsCards />
            </div>
          )}
        </div>

        {isModalOpen && (
          <ModuleModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onCreate={handleCreateModule}
          />
        )}
      </Layout>
    </>
  );
};
