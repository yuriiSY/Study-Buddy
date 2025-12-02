import { useEffect, useState } from "react";

const THEMES = ["dark", "light", "sepia"];

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("sb-theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("sb-theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    const idx = THEMES.indexOf(theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next);
  };

  const label =
    theme === "dark" ? "Dark" : theme === "light" ? "Light" : "Sepia";

  const icon =
    theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "📜";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="btn btn-ghost theme-toggle"
      aria-label={`Change theme (current: ${label})`}
    >
      <span style={{ marginRight: "0.4rem" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}