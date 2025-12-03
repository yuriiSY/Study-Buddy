import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import App from "./App.jsx";

(() => {
  const stored = localStorage.getItem("sb-theme");
  let theme = "light";

  if (stored === "light" || stored === "dark" || stored === "sepia") {
    theme = stored;
  } else {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme = prefersDark ? "dark" : "light";
  }

  document.documentElement.dataset.theme = theme;
})();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/Study-Buddy">
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
