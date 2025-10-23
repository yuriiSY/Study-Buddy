import React from "react";
import Card from "../Card/Card";
import UploadCard from "../UploadCard/UploadCard";
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
      <UploadCard
        title="Upload Study Material"
        description="Upload your PDFs, notes, or reference materials for future sessions."
        imageUrl={images["create_study_space.png"]}
        linkUrl="/upload"
      />
      <div className={styles.cards}>
        {cardsData.map((card, index) => {
          let link = card.linkUrl;

          if (card.title === "Resume Study" && latestFileId) {
            link = `${card.linkUrl}/${latestFileId}`;
          }

          return (
            <Card
              key={index}
              title={card.title}
              description={card.description}
              imageUrl={images[card.image]}
              linkUrl={link}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CardsSection;
