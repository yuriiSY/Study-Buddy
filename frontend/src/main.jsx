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

// Theme bootstrap – same as before
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

const rootElement = document.getElementById("root");

// Vite: BASE_URL is "/" in dev, and your `base` (e.g. "/Study-Buddy/") in prod
const basename = import.meta.env.BASE_URL.replace(/\/$/, ""); // keep leading "/", drop trailing "/"

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </Provider>
    </StrictMode>
  );
}
