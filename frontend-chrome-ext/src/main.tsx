import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Import App as a component, not a type
import './App.css';


function init() {
  console.log("hi its me:::")
  const root = document.createElement("div");
  root.className = "container-color-picker";
  root.style.width = "10px";
  root.style.height = "10px";
  root.style.position = "fixed";
  root.style.border = "solid 1px red";
  root.style.bottom = "50px";
  root.style.right = "50px";
  root.style.backgroundColor = "red";
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
