import { useEffect, useState } from "react";

const ModoOscuroToggle = () => {
  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem("modo-oscuro") === "true";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (modoOscuro) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("modo-oscuro", modoOscuro);
  }, [modoOscuro]);

  return (
    <button
      onClick={() => setModoOscuro(!modoOscuro)}
      className="px-3 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 dark:text-white"
    >
      {modoOscuro ? "☀️ Claro" : "🌙 Oscuro"}
    </button>
  );
};

export default ModoOscuroToggle;
