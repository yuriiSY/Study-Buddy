import React from "react";
import Card from "../Card/Card";
import cardsData from "../../data/cardsData.json";
import styles from "./CardsSection.module.css";

import createStudySpaceImg from "../../assets/create_study_space.png";
import resumeStudyImg from "../../assets/resume_study.png";
import selfAssessmentImg from "../../assets/self_asessment.png";
import mockExamsImg from "../../assets/mock_exams.png";
import smartRevisionImg from "../../assets/smart_revision.png";
import achievementsImg from "../../assets/achievments.png";

const images = {
  "create_study_space.png": createStudySpaceImg,
  "resume_study.png": resumeStudyImg,
  "self_asessment.png": selfAssessmentImg,
  "mock_exams.png": mockExamsImg,
  "smart_revision.png": smartRevisionImg,
  "achievments.png": achievementsImg,
};

const CardsSection = () => {
  return (
    <div className={styles.cardsSection}>
      {cardsData.map((card, index) => (
        <Card
          key={index}
          title={card.title}
          description={card.description}
          imageUrl={images[card.image]}
          linkUrl={card.linkUrl}
        />
      ))}
    </div>
  );
};

export default CardsSection;
