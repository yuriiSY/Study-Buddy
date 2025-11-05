import React from "react";
import styles from "./MaterialList.module.css";
import MaterialItem from "../MaterialItem/MaterialItem";

export default function MaterialList({ materials, onSelect, selectedId }) {
  return (
    <div className={styles.list}>
      {materials.map((m) => (
        <MaterialItem
          key={m.id}
          material={m}
          onClick={() => onSelect(m.id)}
          isSelected={m.id === selectedId}
        />
      ))}
    </div>
  );
}
