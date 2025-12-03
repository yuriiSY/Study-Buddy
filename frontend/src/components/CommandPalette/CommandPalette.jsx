import React, { useEffect, useMemo, useState, useRef } from "react";
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

  const inputRef = useRef(null);

  // Load modules once when opened
  useEffect(() => {
    if (!isOpen) return;

    const fetchModules = async () => {
      // only fetch if we don't already have them
      if (modules.length > 0) return;
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

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      if (inputRef.current) {
        // slight delay for mount
        setTimeout(() => inputRef.current?.focus(), 10);
      }
    }
  }, [isOpen]);

  // Quick global actions
  const baseActions = useMemo(
    () => [
      {
        id: "go-home",
        label: "Go to dashboard",
        meta: "Navigation",
        run: () => navigate("/home"),
      },
      {
        id: "welcome",
        label: "Go to welcome page",
        meta: "Navigation",
        run: () => navigate("/"),
      },
      {
        id: "login",
        label: "Go to login",
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

  // Modules as searchable items
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

  // Filtered search
  const filteredActions = useMemo(() => {
    if (!query.trim()) return allActions;

    const q = query.toLowerCase();
    return allActions.filter((action) => {
      const label = action.label.toLowerCase();
      const meta = (action.meta || "").toLowerCase();
      return label.includes(q) || meta.includes(q);
    });
  }, [allActions, query]);

  // Keyboard navigation  
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
          <span className={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search modules, pages and actions…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className={styles.shortcutHint}>Ctrl+K</span>
        </div>

        <div className={styles.hintRow}>
          <span>
            Use <strong>↑</strong> / <strong>↓</strong> to navigate,{" "}
            <strong>Enter</strong> to open, <strong>Esc</strong> to close.
          </span>
          {loadingModules && (
            <span className={styles.loadingText}>Loading modules…</span>
          )}
        </div>

        <div className={styles.listWrapper}>
          <ul className={styles.list} role="listbox">
            {filteredActions.length === 0 && (
              <li className={styles.empty}>
                No matches. Try searching for a module name or action.
              </li>
            )}

            {/* Group: Quick actions */}
            {filteredActions.some((a) => a.meta === "Navigation" || a.meta === "Appearance") && (
              <>
                <li className={styles.groupLabel}>Quick actions</li>
                {filteredActions
                  .filter(
                    (a) => a.meta === "Navigation" || a.meta === "Appearance"
                  )
                  .map((action, index) => {
                    const globalIndex = filteredActions.indexOf(action);
                    return (
                      <li
                        key={action.id}
                        className={`${styles.item} ${
                          globalIndex === selectedIndex
                            ? styles.itemActive
                            : ""
                        }`}
                        onClick={() => {
                          action.run();
                          onClose();
                        }}
                      >
                        <div className={styles.itemMain}>
                          <span className={styles.itemLabel}>
                            {action.label}
                          </span>
                          <span className={styles.itemMeta}>
                            {action.meta}
                          </span>
                        </div>
                      </li>
                    );
                  })}
              </>
            )}

            {/* Group: Modules */}
            {filteredActions.some((a) => a.meta === "Module") && (
              <>
                <li className={styles.groupLabel}>Modules</li>
                {filteredActions
                  .filter((a) => a.meta === "Module")
                  .map((action) => {
                    const globalIndex = filteredActions.indexOf(action);
                    return (
                      <li
                        key={action.id}
                        className={`${styles.item} ${
                          globalIndex === selectedIndex
                            ? styles.itemActive
                            : ""
                        }`}
                        onClick={() => {
                          action.run();
                          onClose();
                        }}
                      >
                        <div className={styles.itemMain}>
                          <span className={styles.itemLabel}>
                            {action.label}
                          </span>
                          <span className={styles.itemMeta}>
                            {action.meta}
                          </span>
                        </div>
                      </li>
                    );
                  })}
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
