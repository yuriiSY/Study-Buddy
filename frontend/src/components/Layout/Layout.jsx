// src/components/Layout/Layout.jsx
import React from "react";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
  return (
    <div className={styles.appShell}>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Layout;
