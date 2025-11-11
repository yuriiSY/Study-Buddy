import React from "react";
import { ClipLoader } from "react-spinners";
import styles from "./LoaderOverlay.module.css";

const LoaderOverlay = () => {
  return (
    <div className={styles.overlay}>
      <ClipLoader size={60} color="#3498db" />
    </div>
  );
};

export default LoaderOverlay;
