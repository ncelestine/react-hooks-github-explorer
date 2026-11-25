import { useState } from "react";
import GitHubApp from "./GitHubApp";
import HookExamples from "./HookExamples";

export default function App() {
  const [view, setView] = useState("explorer");

  const tabStyle = (active) => ({
    padding: "8px 16px",
    marginRight: "8px",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    background: active ? "#2563eb" : "#fff",
    color: active ? "#fff" : "#2563eb",
    cursor: "pointer",
  });

  return (
    <div>
      <nav style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
        <button style={tabStyle(view === "explorer")} onClick={() => setView("explorer")}>
          GitHub Explorer
        </button>
        <button style={tabStyle(view === "examples")} onClick={() => setView("examples")}>
          Hook Examples
        </button>
      </nav>
      {view === "explorer" ? <GitHubApp /> : <HookExamples />}
    </div>
  );
}
