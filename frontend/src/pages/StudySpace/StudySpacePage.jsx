import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Flashcard from "../../components/Flashcard/Flashcard";
import WorkspaceLayout from "../../components/WorkspaceLayout/WorkspaceLayout";
import MCQTest from "../../components/MCQTest/MCQTest";
import DocxViewer from "../../components/DocViewer/DocViewer";
import Chat from "../../components/Chat/Chat";
import styles from "./StudySpacePage.module.css";
import FocusHeader from "../../components/FocusHeader/FocusHeader";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import CustomPdfViewer from "../../components/CustomDocViewer/CustomDocViewer";

import api from "../../api/axios";

const cardsData = [
  {
    id: 1,
    topic: "Integration",
    difficulty: "Hard",
    question: "State the Fundamental Theorem of Calculus",
    answer:
      "It links the concept of differentiation and integration, stating that the derivative of the integral of a function is the function itself.",
  },
  {
    id: 2,
    topic: "Limits",
    difficulty: "Medium",
    question: "What is the limit of sin(x)/x as x approaches 0?",
    answer: "The limit is 1.",
  },
];

const sampleQuestions = [
  {
    id: "q1",
    topic: "Derivatives",
    difficulty: "Medium",
    question: "What is the derivative of f(x) = x³ + 2x² - 5x + 1?",
    options: [
      "3x² + 4x - 5",
      "3x² + 2x - 5",
      "x⁴ + 2x³ - 5x² + x",
      "3x² + 4x + 5",
    ],
    correctAnswer: "3x² + 2x - 5",
  },
];

export const StudySpacePage = () => {
  const { moduleId } = useParams();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const docs = useMemo(
    () => [
      {
        uri: "/asd.pdf",
        fileType: "pdf",
        fileName: "sample.pdf",
      },
    ],
    []
  );

  const Viewer = React.memo(() => <CustomPdfViewer />);

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/files/modules/${moduleId}/files`);
      const backendFiles = res.data.files || [];

      const formattedModules = backendFiles.map((file, index) => ({
        title: `File ${index + 1}. ${file.filename}`,
        id: file.id,
      }));

      setModules(formattedModules);

      if (!selectedFile && formattedModules.length > 0) {
        setSelectedFile(formattedModules[0]);
        setSelectedFeature("Notes");
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [moduleId]);

  const handleFeatureSelect = (file, feature) => {
    setSelectedFeature(feature);
    setSelectedFile(file);
    console.log(`Selected ${feature} for ${file.title}`);
  };

  const handleSubmit = (answers) => {
    console.log("Submitted answers:", answers);
  };

  const renderContent = () => {
    switch (selectedFeature) {
      case "Flashcards":
        return <Flashcard cards={cardsData} />;
      case "Quiz":
        return <MCQTest questions={sampleQuestions} onSubmit={handleSubmit} />;
      case "AI Buddy":
        return (
          <div className={styles.studySpaceContainer}>
            <DocxViewer fileId={selectedFile?.id} moduleId={moduleId} />
            <Chat />
          </div>
        );
      default:
        return <DocxViewer fileId={selectedFile?.id} moduleId={moduleId} />;
      // return (
      //   <div style={{ width: "100%", height: "500px" }}>
      //     <Viewer docs={docs} />
      //   </div>
      // );
    }
  };

  if (loading) return <p>Loading files...</p>;

  return (
    <WorkspaceLayout
      modules={modules}
      onFeatureSelect={handleFeatureSelect}
      selectedModuleId={moduleId}
      onFilesAdded={fetchFiles}
      hasSidebar={true}
    >
      {/* <FocusHeader /> */}
      {renderContent()}
      {/* <button
        onClick={async () => {
          const res = await api.get(`/files/modules/8`);
          window.open(res.data.url, "_blank");
        }}
      >
        Download File
      </button> */}
    </WorkspaceLayout>
  );
};
