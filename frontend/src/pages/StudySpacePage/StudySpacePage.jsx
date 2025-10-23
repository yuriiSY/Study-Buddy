import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import DocxViewer from "../../components/DocViewer/DocViewer";
import Chat from "../../components/Chat/Chat";
import FocusHeader from "../../components/FocusHeader/FocusHeader";
import styles from "./StudySpacePage.module.css";

export const StudySpacePage = () => {
  return (
    <>
      <Layout>
        <Header />
        <FocusHeader sessionName="Session 1" />
        <div className={styles.studySpaceContainer}>
          <DocxViewer />
          <Chat />
        </div>
      </Layout>
    </>
  );
};
