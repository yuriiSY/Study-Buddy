import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WelcomePage.module.css";
import logoImg from "../../assets/logo2.png";

// Feature data for the carousel
const FEATURES = [
  {
    title: "Upload Notes",
    description:
      "Upload text, PDFs, and images such as lecture slides or handwritten notes. Study Buddy extracts and processes content using AI.",
    icon: "📘",
  },
  {
    title: "Audio & Video Support",
    description:
      "Upload lecture recordings and videos to get transcripts, summaries, and quizzes generated from your media.",
    icon: "🎧",
  },
  {
    title: "Auto-Generated Quizzes",
    description:
      "Generate practice questions from your notes to power active recall and spaced repetition.",
    icon: "❓",
  },
  {
    title: "Pomodoro Timer",
    description:
      "Use a built-in focus timer with work / break cycles that connects to rewards and progress.",
    icon: "⏱️",
  },
  {
    title: "Rewards & Gamification",
    description:
      "Earn points, badges, and climb leaderboards to stay motivated and build consistent study habits.",
    icon: "🏆",
  },
  {
    title: "Weak-Spot Detection",
    description:
      "Track performance and note coverage so Study Buddy can highlight topics you need to revisit.",
    icon: "📊",
  },
  {
    title: "AI Tutor Chat",
    description:
      "Ask questions directly about your modules or notes. Get explanations, summaries, and practice prompts on demand.",
    icon: "💬",
  },
  {
    title: "Study Partners",
    description:
      "Find other students studying similar modules or topics so you can learn together.",
    icon: "👥",
  },
  {
    title: "Community Forum",
    description:
      "Ask and answer questions, share resources, and learn from a community of students.",
    icon: "🧩",
  },
];

// --- FeatureCarousel: 3 cards at a time, manual arrows, smooth slide ---

const FeatureCarousel = () => {
  const [index, setIndex] = useState(0);
  const visibleCount = 3;
  const maxIndex = Math.max(0, FEATURES.length - visibleCount);

  const handleNext = () => {
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <div className={styles.carouselViewport}>
      <button
        type="button"
        className={styles.carouselArrow}
        onClick={handlePrev}
        aria-label="Previous features"
      >
        <span className={styles.carouselArrowIcon}>‹</span>
      </button>

      <div className={styles.carouselWindow}>
        <div
          className={styles.carouselRow}
          style={{
            transform: `translateX(-${(index * 100) / visibleCount}%)`,
          }}
        >
          {FEATURES.map((feature, idx) => (
            <article
              key={`${feature.title}-${idx}`}
              className={styles.featureCard}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.carouselArrow}
        onClick={handleNext}
        aria-label="Next features"
      >
        <span className={styles.carouselArrowIcon}>›</span>
      </button>
    </div>
  );
};



export const WelcomePage = () => {
  const navigate = useNavigate();

  // --- THEME STATE: "light" | "dark" | "sepia" ---
  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "light";

    const htmlTheme = document.documentElement.dataset.theme;
    if (htmlTheme === "light" || htmlTheme === "dark" || htmlTheme === "sepia") {
      return htmlTheme;
    }

    const stored = window.localStorage.getItem("sb-theme");
    if (stored === "light" || stored === "dark" || stored === "sepia") {
      return stored;
    }

    return "light";
  });

  // Apply theme to <html data-theme="..."> and persist preference
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("sb-theme", theme);
  }, [theme]);

  const handleGetStarted = () => navigate("/register");
  const handleSignIn = () => navigate("/login");

  const handleGithub = () => {
    window.open(
      "https://github.com/yuriiSY/Study-Buddy/",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className={styles.pageRoot}>
      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroTopBar}>
            <div className={styles.brand}>
              <div className={styles.brandIconWrapper}>
                <img
                  src={logoImg}
                  alt="Study Buddy logo"
                  className={styles.brandIcon}
                />
              </div>
              <div>
                <div className={styles.brandName}>Study Buddy</div>
                <div className={styles.brandTagline}>
                  AI-Powered Study Assistant
                </div>
              </div>
            </div>

            <div className={styles.topRight}>
              <div
                className={styles.themeToggle}
                role="group"
                aria-label="Theme toggle"
              >
                <button
                  type="button"
                  className={`${styles.themeToggleButton} ${
                    theme === "light" ? styles.themeToggleButtonActive : ""
                  }`}
                  onClick={() => setTheme("light")}
                  aria-pressed={theme === "light"}
                  title="Light mode"
                >
                  ☀️
                </button>
                <button
                  type="button"
                  className={`${styles.themeToggleButton} ${
                    theme === "sepia" ? styles.themeToggleButtonActive : ""
                  }`}
                  onClick={() => setTheme("sepia")}
                  aria-pressed={theme === "sepia"}
                  title="Sepia mode"
                >
                  📖
                </button>
                <button
                  type="button"
                  className={`${styles.themeToggleButton} ${
                    theme === "dark" ? styles.themeToggleButtonActive : ""
                  }`}
                  onClick={() => setTheme("dark")}
                  aria-pressed={theme === "dark"}
                  title="Dark mode"
                >
                  🌙
                </button>
              </div>

              <button
                type="button"
                className={styles.signInButton}
                onClick={handleSignIn}
              >
                Sign in
              </button>
            </div>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroPill}>AI-Powered Study Assistant</div>
            <h1 className={styles.heroTitle}>
              Study Buddy: Your AI-Powered Study Assistant
            </h1>
            <p className={styles.heroSubtitle}>
              Study Buddy helps you study smarter, not harder. Upload notes and
              lecture materials, generate quizzes, track weak spots, use a
              Pomodoro timer, and chat with an AI tutor – all in one platform
              designed to help you ace your exams.
            </p>

            <button
              type="button"
              className={styles.heroCta}
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <main>
        <section className={styles.featuresSection}>
          <div className={styles.featuresInner}>
            <h2 className={styles.featuresTitle}>
              Study Buddy Features: Everything You Need to Study Better
            </h2>
            <p className={styles.featuresSubtitle}>
              Study Buddy&apos;s AI-powered tools help you create, organise, and
              revise more effectively — from rich note uploads to automated
              quizzes, timers, rewards, and an AI tutor that understands your
              modules.
            </p>

            <FeatureCarousel />
          </div>
        </section>

        {/* PROJECT SECTION */}
        <section className={styles.projectSection}>
          <div className={styles.projectInner}>
            <h2 className={styles.projectTitle}>
              Start Using Study Buddy Today
            </h2>
            <p className={styles.projectText}>
              AI Study Buddy is an MSc in Computer Science
              (Advanced Software Development) capstone project at
              Technological University Dublin. It explores how modern AI and
              cloud-native architecture can support students with note
              ingestion, quiz generation, and intelligent study workflows.
            </p>
            <p className={styles.projectText}>
              The project is open source and developed by Anika Siddiqui
              Mayesha, Yurii Sykal, Rumaysa Qayyum Babulkhair, and Lorenzo
              Palleschi. You can explore the full codebase, documentation, and
              deployment setup on GitHub.
            </p>

            <button
              type="button"
              className={styles.githubButton}
              onClick={handleGithub}
            >
              View GitHub Repository
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WelcomePage;
