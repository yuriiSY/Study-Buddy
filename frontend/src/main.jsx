import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Switched to HashRouter over BrowserRouter
import { HashRouter } from "react-router-dom";

// dark-mode provider
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <HashRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);
