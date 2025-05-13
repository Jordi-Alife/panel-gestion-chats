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
    <div
      className="relative inline-block w-12 h-6 align-middle select-none transition"
      onClick={() => setModoOscuro(!modoOscuro)}
      role="switch"
      aria-checked={modoOscuro}
    >
      <div className={`block w-12 h-6 rounded-full transition ${
        modoOscuro ? "bg-gray-700" : "bg-gray-300"
      }`} />
      <div className={`dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
        modoOscuro ? "translate-x-6" : "translate-x-0"
      }`} />
    </div>
  );
};

export default ModoOscuroToggle;
