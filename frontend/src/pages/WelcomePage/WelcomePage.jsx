import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import StudyOptions from "../../components/StudyOptions/StudyOptions";
import StudySection from "../../components/StudySection/StudySection";

import intoImg1 from "../../assets/introImg1.png";
import intoImg2 from "../../assets/introImg2.png";
import intoImg3 from "../../assets/introImg2.png";

export const WelcomePage = () => {
  const studySections = [
    {
      title: "Choose how you want to study",
      description:
        "Turn recap cards into multiple-choice questions and more using Study Mode. Strengthen your knowledge with fun learning games like Matching.",
      buttonText: "Start",
      image: intoImg3,
      bgColor: "#f9faff",
      reverse: false,
    },
    {
      title: "Master concepts efficiently",
      description:
        "Practice smarter, not harder. Get instant feedback and detailed explanations as you learn key terms.",
      buttonText: "Try Now",
      image: intoImg1,
      bgColor: "#f5f7fb",
      reverse: true,
    },
    {
      title: "Track your progress",
      description:
        "Stay motivated with visual progress charts and personalized study recommendations based on your performance.",
      buttonText: "View Progress",
      image: intoImg2,
      bgColor: "#f9f9ff",
      reverse: false,
    },
  ];
  return (
    <>
      <Header />
      <Layout>
        <StudyOptions />
        {studySections.map((section, index) => (
          <StudySection
            key={index}
            title={section.title}
            description={section.description}
            buttonText={section.buttonText}
            image={section.image}
            bgColor={section.bgColor}
            reverse={section.reverse}
          />
        ))}
      </Layout>
    </>
  );
};
