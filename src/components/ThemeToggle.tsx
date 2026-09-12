import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [light, setLight] = useState(() => document.documentElement.dataset.theme === "light");

  function toggle() {
    const next = !light;
    const theme = next ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next ? "#f7f5fc" : "#0a0813");
    try { localStorage.setItem("reach-theme", theme); } catch { /* Storage is optional. */ }
    setLight(next);
  }

  return (
    <button type="button" role="switch" aria-checked={light} aria-label="Light mode"
      title={light ? "Switch to dark mode" : "Switch to light mode"}
      onClick={toggle} className="theme-toggle">
      <span className="theme-toggle-thumb" />
      <Sun size={16} aria-hidden="true" />
      <Moon size={16} aria-hidden="true" />
    </button>
  );
}
