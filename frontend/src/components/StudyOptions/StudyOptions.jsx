import React from "react";
import Slider from "react-slick";
import styles from "./StudyOptions.module.css";
import StudyCard from "../StudyCard/StudyCard";
import { useNavigate } from "react-router-dom";

const StudyOptions = () => {
  // Features aligned with README short overview
  const cards = [
    {
      title: "Upload Notes",
      color: "#FDE68A",
      image: "https://cdn-icons-png.flaticon.com/512/1828/1828911.png", // documents / notes
    },
    {
      title: "AI Processing",
      color: "#C6F7E2",
      image: "https://cdn-icons-png.flaticon.com/512/2830/2830308.png", // brain / processing
    },
    {
      title: "Quizzes & Practice",
      color: "#5A4FF3",
      image: "https://cdn-icons-png.flaticon.com/512/2593/2593448.png", // quiz / test
    },
    {
      title: "Pomodoro Timer",
      color: "#FFF0C9",
      image: "https://cdn-icons-png.flaticon.com/512/2088/2088617.png", // timer
    },
    {
      title: "Gamification",
      color: "#E9D8FD",
      image: "https://cdn-icons-png.flaticon.com/512/2784/2784463.png", // game / rewards
    },
    {
      title: "Weak-spot Analysis",
      color: "#FEE2E2",
      image: "https://cdn-icons-png.flaticon.com/512/2721/2721298.png", // target / analytics
    },
    {
      title: "AI Tutor Chat",
      color: "#C7E9FB",
      image: "https://cdn-icons-png.flaticon.com/512/2920/2920214.png", // chatbot / tutor
    },
    {
      title: "Study Partners & Community",
      color: "#FEF9C3",
      image: "https://cdn-icons-png.flaticon.com/512/3233/3233475.png", // people / community
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <h1 className={styles.title}>How do you want to study?</h1>
        <p className={styles.subtitle}>
          Master any material using AI Study Buddy&apos;s smart tools.
        </p>
        <button className={styles.button} onClick={() => navigate("/register")}>
          Sign up
        </button>
      </div>

      <div className={styles.sliderContainer}>
        <Slider {...settings}>
          {cards.map((card, i) => (
            <div key={i} className={styles.slide}>
              <StudyCard {...card} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default StudyOptions;
