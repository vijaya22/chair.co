import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

function init() {
  const root = document.createElement("div");
  root.className = "chairco-picker-root";
  root.style.position = "fixed";
  root.style.bottom = "24px";
  root.style.right = "24px";
  root.style.zIndex = "2147483647"; // stay on top
  document.body.appendChild(root);

  const rootDiv = ReactDOM.createRoot(root);
  rootDiv.render(<App />);
}

init();
