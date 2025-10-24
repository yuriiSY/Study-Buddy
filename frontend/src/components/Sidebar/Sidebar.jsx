import React, { useState } from "react";
import styles from "./Sidebar.module.css";
import { ChevronDown, ChevronRight } from "lucide-react";

const studyFeatures = [
  { name: "Flashcards", icon: "📘" },
  { name: "AI Buddy", icon: "🧠" },
  { name: "Quiz", icon: "📝" },
];

const Sidebar = ({ modules, isOpen, onClose, onFeatureSelect }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleModule = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Modules</h2>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      <ul className={styles.list}>
        {modules.map((mod, index) => (
          <li key={index} className={styles.item}>
            <div
              className={`${styles.itemHeader} ${
                activeIndex === index ? styles.active : ""
              }`}
              onClick={() => toggleModule(index)}
            >
              <span>
                {index + 1}. {mod.title}
              </span>
              {activeIndex === index ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </div>

            {activeIndex === index && (
              <ul className={styles.features}>
                {studyFeatures.map((feature, i) => (
                  <li
                    key={i}
                    className={styles.featureItem}
                    onClick={() => onFeatureSelect(mod, feature.name)}
                  >
                    <span className={styles.icon}>{feature.icon}</span>
                    {feature.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
