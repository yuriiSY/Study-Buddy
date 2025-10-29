import React, { useState } from "react";

import Layout from "../components/Layout/Layout";
import Header from "../components/Header/Header";
import CardsSection from "../components/CardsSection/CardsSection";
import HotDiscussions from "../components/HotDiscussions/HotDiscussions";
import styles from "./HomePage.module.css";
import Onboarding from "../components/Onboarding/Onboarding";

export const HomePage = () => {
  return (
    <>
      <Layout>
        <Header />
        <div className={styles.homePage}>
          {/* <CardsSection />
          <HotDiscussions /> */}
          <Onboarding />
        </div>
      </Layout>
    </>
  );
};
