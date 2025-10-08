import Layout from "../components/Layout/Layout";
import Header from "../components/Header/Header";
import CardsSection from "../components/CardsSection/CardsSection";
import HotDiscussions from "../components/HotDiscussions/HotDiscussions";
import styles from "./HomePage.module.css";

export const HomePage = () => {
  return (
    <>
      <Layout>
        <Header />
        <div className={styles.homePage}>
          <CardsSection />
          <HotDiscussions />
        </div>
      </Layout>
    </>
  );
};
