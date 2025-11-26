import React, { useEffect, useMemo, useState } from "react";
import styles from "./CommandPalette.module.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Fetch modules when palette is opened for the first time
  useEffect(() => {
    if (!isOpen || modules.length > 0) return;

    const fetchModules = async () => {
      try {
        setLoadingModules(true);
        const res = await api.get("/files/modules");
        setModules(res.data.modules || []);
      } catch (err) {
        console.error("Failed to load modules for command palette:", err);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, [isOpen, modules.length]);

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const baseActions = useMemo(
    () => [
      {
        id: "home",
        label: "Go to Home",
        meta: "Navigation",
        run: () => navigate("/"),
      },
      {
        id: "welcome",
        label: "Open Welcome page",
        meta: "Navigation",
        run: () => navigate("/welcome"),
      },
      {
        id: "login",
        label: "Go to Login",
        meta: "Navigation",
        run: () => navigate("/login"),
      },
      {
        id: "toggle-theme",
        label:
          theme === "light" ? "Switch to dark mode" : "Switch to light mode",
        meta: "Appearance",
        run: () => toggleTheme(),
      },
    ],
    [navigate, theme, toggleTheme]
  );

  const moduleActions = useMemo(
    () =>
      modules.map((m) => ({
        id: `module-${m.id}`,
        label: m.title || "Untitled module",
        meta: "Module",
        run: () => navigate(`/modules/${m.id}`),
      })),
    [modules, navigate]
  );

  const allActions = useMemo(
    () => [...baseActions, ...moduleActions],
    [baseActions, moduleActions]
  );

  const filteredActions = useMemo(() => {
    if (!query.trim()) return allActions;
    const q = query.toLowerCase();
    return allActions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        (a.meta && a.meta.toLowerCase().includes(q))
    );
  }, [allActions, query]);

  // Keyboard navigation inside the palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, Math.max(filteredActions.length - 1, 0))
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const action = filteredActions[selectedIndex];
        if (action) {
          action.run();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredActions, isOpen, onClose, selectedIndex]);

  // Auto-focus input
  const inputRef = React.useRef(null);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={styles.searchRow}>
          <span className={styles.searchIcon}>⌘K</span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search modules or actions…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
        </div>

        <div className={styles.hintRow}>
          <span>
            Press <strong>↑</strong> / <strong>↓</strong> to navigate,{" "}
            <strong>Enter</strong> to select, <strong>Esc</strong> to close.
          </span>
          <span className={styles.loadingText}>
            {loadingModules ? "Loading modules…" : ""}
          </span>
        </div>

        <ul className={styles.list} role="listbox">
          {filteredActions.length === 0 && (
            <li className={styles.empty}>No matches. Try a different search.</li>
          )}

          {filteredActions.map((action, index) => (
            <li
              key={action.id}
              className={`${styles.item} ${
                index === selectedIndex ? styles.itemActive : ""
              }`}
              onClick={() => {
                action.run();
                onClose();
              }}
            >
              <div className={styles.itemLabel}>{action.label}</div>
              <div className={styles.itemMeta}>{action.meta}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
