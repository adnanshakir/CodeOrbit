import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SandboxProvider } from "@/context/SandboxContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <SandboxProvider>
    <App />
  </SandboxProvider>,
);
