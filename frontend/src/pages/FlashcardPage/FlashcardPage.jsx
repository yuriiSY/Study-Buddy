import React, { useState } from "react";
import Flashcard from "../../components/Flashcard/Flashcard";
import WorkspaceLayout from "../../components/WorkspaceLayout/WorkspaceLayout";
import MCQTest from "../../components/MCQTest/MCQTest";
import DocxViewer from "../../components/DocViewer/DocViewer";
import Chat from "../../components/Chat/Chat";
import styles from "../StudySpacePage/StudySpacePage.module.css";
import FocusHeader from "../../components/FocusHeader/FocusHeader";

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

export const FlashcardPage = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const modules = [
    { title: "File 1. Node.js Basics" },
    { title: "File 2. Express" },
    { title: "File 3. MongoDB" },
  ];

  const handleFeatureSelect = (module, feature) => {
    setSelectedFeature(feature);
    setSelectedModule(module);
    console.log(`Selected ${feature} for ${module.title}`);
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
            <DocxViewer />
            <Chat />
          </div>
        );
      default:
        return <DocxViewer />;
    }
  };

  return (
    <WorkspaceLayout
      modules={modules}
      onFeatureSelect={handleFeatureSelect}
      hasSidebar={true}
    >
      <FocusHeader />
      {renderContent()}
    </WorkspaceLayout>
  );
};
