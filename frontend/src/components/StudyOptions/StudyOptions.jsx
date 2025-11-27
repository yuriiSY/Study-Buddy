import React from "react";
import Slider from "react-slick";
import styles from "./StudyOptions.module.css";
import StudyCard from "../StudyCard/StudyCard";
import { useNavigate } from "react-router-dom";

const StudyOptions = () => {
  const cards = [
    {
      title: "Matching",
      color: "#FFDAD6",
      image: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    },
    {
      title: "Expert Solutions",
      color: "#C6F7E2",
      image: "https://cdn-icons-png.flaticon.com/512/2920/2920214.png",
    },
    {
      title: "Memorisation",
      color: "#C7E9FB",
      image: "https://cdn-icons-png.flaticon.com/512/2830/2830308.png",
    },
    {
      title: "Flashcards",
      color: "#5A4FF3",
      image: "https://cdn-icons-png.flaticon.com/512/821/821484.png",
    },
    {
      title: "Definitions",
      color: "#FFF0C9",
      image: "https://cdn-icons-png.flaticon.com/512/2721/2721298.png",
    },
    {
      title: "Practice Tests",
      color: "#E9D8FD",
      image: "https://cdn-icons-png.flaticon.com/512/2593/2593448.png",
    },
    {
      title: "Diagrams",
      color: "#FEE2E2",
      image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
    },
    {
      title: "Games",
      color: "#DCFCE7",
      image: "https://cdn-icons-png.flaticon.com/512/2784/2784463.png",
    },
    {
      title: "Study Plan",
      color: "#FEF9C3",
      image: "https://cdn-icons-png.flaticon.com/512/3707/3707225.png",
    },
    {
      title: "Notes",
      color: "#FDE68A",
      image: "https://cdn-icons-png.flaticon.com/512/1828/1828911.png",
    },
  ];

const settings = {
  dots: true,
  infinite: true,
  speed: 400,
  slidesToShow: 4,
  slidesToScroll: 1,
  arrows: true,
  autoplay: true,
  autoplaySpeed: 2500,
  responsive: [
    {
      breakpoint: 1024,
      settings: { slidesToShow: 3 }, // tablet
    },
    {
      breakpoint: 768,
      settings: { slidesToShow: 2 }, // small tablet
    },
    {
      breakpoint: 480,
      settings: { slidesToShow: 1 }, // mobile
    },
  ],
};


  const navigate = useNavigate();
  const goToAuth = () => navigate("/login"); // all cards & CTA → login

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <h1 className={styles.title}>How do you want to study?</h1>
        <p className={styles.subtitle}>
          Master any material with interactive study modes in Study Buddy –
          flashcards, memorisation, practice tests and more.
        </p>
        <button className={styles.button} onClick={goToAuth}>
          Sign up or log in
        </button>
      </div>

      <div className={styles.sliderContainer}>
        <Slider {...settings}>
          {cards.map((card, i) => (
            <div
              key={i}
              className={styles.slide}
              onClick={goToAuth}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goToAuth();
                }
              }}
            >
              <StudyCard {...card} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default StudyOptions;
