import React, { useState } from "react";

import ModuleModal from "../components/ModuleModal/ModuleModal";
import Layout from "../components/Layout/Layout";
import Header from "../components/Header/Header";
import CardsSection from "../components/CardsSection/CardsSection";
import HotDiscussions from "../components/HotDiscussions/HotDiscussions";
import styles from "./HomePage.module.css";
import ModuleCard from "../components/ModuleCard/ModuleCard";

export const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStart = (data) => {
    console.log("New module created:", data);
  };
  return (
    <>
      <Layout>
        <Header />
        <div className={styles.homePage}>
          <CardsSection />
          <HotDiscussions />
        </div>
      </Layout>
      <ModuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={handleStart}
      />
    </>
  );
};
