import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Import App as a component, not a type

function init() {
  console.log("hi its me:::")
  const root = document.createElement("div");
  root.className = "container-color-picker";
  document.body.appendChild(root);

  const rootDiv = ReactDOM.createRoot(root);
  rootDiv.render(<App />);
}

init();
