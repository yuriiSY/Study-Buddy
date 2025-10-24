import React from "react";
import Slider from "react-slick";
import styles from "./StudyOptions.module.css";
import StudyCard from "../StudyCard/StudyCard";

const StudyOptions = () => {
  const cards = [
    {
      title: "Matching",
      color: "#FFDAD6",
      image: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
      text: "lungs",
    },
    {
      title: "Expert Solutions",
      color: "#C6F7E2",
      image: "https://cdn-icons-png.flaticon.com/512/2920/2920214.png",
      text: "Step 1: Anaphase phase...",
    },
    {
      title: "Memorization",
      color: "#C7E9FB",
      image: "https://cdn-icons-png.flaticon.com/512/2830/2830308.png",
      text: "la pintura",
    },
    {
      title: "Flashcards",
      color: "#5A4FF3",
      image: "https://cdn-icons-png.flaticon.com/512/821/821484.png",
      text: "superior vena cava",
    },
    {
      title: "Definitions",
      color: "#FFF0C9",
      image: "https://cdn-icons-png.flaticon.com/512/2721/2721298.png",
      text: "photosynthesis",
    },
    {
      title: "Practice Tests",
      color: "#E9D8FD",
      image: "https://cdn-icons-png.flaticon.com/512/2593/2593448.png",
      text: "Quiz Mode",
    },
    {
      title: "Diagrams",
      color: "#FEE2E2",
      image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
      text: "Heart structure",
    },
    {
      title: "Games",
      color: "#DCFCE7",
      image: "https://cdn-icons-png.flaticon.com/512/2784/2784463.png",
      text: "Match challenge",
    },
    {
      title: "Study Plan",
      color: "#FEF9C3",
      image: "https://cdn-icons-png.flaticon.com/512/3707/3707225.png",
      text: "Weekly goals",
    },
    {
      title: "Notes",
      color: "#FDE68A",
      image: "https://cdn-icons-png.flaticon.com/512/1828/1828911.png",
      text: "Summaries",
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

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <h1 className={styles.title}>How do you want to study?</h1>
        <p className={styles.subtitle}>
          Master any material using interactive Study Buddy.
        </p>
        <button className={styles.button}>Sign up </button>
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
