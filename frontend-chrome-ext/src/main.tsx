import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Import App as a component, not a type
import './App.css';


function init() {
  console.log("hi its me:::")
  const root = document.createElement("div");
  root.className = "container-color-picker";
  root.style.position = "fixed";
  root.style.bottom = "24px";
  root.style.right = "24px";
  root.style.width = "320px";
  root.style.maxWidth = "90vw";
  root.style.padding = "8px";
  root.style.border = "1px solid #d1d5db"; // gray-300
  root.style.borderRadius = "8px";
  root.style.backgroundColor = "#fff";
  root.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
  root.style.zIndex = "9999";

  // width: 10px;
  // height: 10px;
  // position: fixed;
  // bottom: 0;
  // right: 0;
  // background-color: red;


  document.body.appendChild(root);

  const rootDiv = ReactDOM.createRoot(root);
  rootDiv.render(<App />);


  // document.addEventListener("mousemove", () => {
  // console.log('because i am here::')
  
  // // document.body.style.cursor = `url(assets/svg/eyedropper.png), auto`;
  //  //document.body.style.cursor = `url(chrome-extension://fblpclbojjcnplhgemecpbbifmebeakn/assets/svg/eyedropper.png), auto`;
  //   //document.body.style.cursor = "not-allowed";
  // });
  
  // // Optional: Reset to default cursor when the mouse leaves a specific area
  // document.addEventListener("mouseleave", () => {
  //   document.body.style.cursor = "default";
  // });

}

init();
