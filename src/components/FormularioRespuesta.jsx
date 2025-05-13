import React from "react";
import iconFile from "/src/assets/file.svg";

const FormularioRespuesta = ({
  userId,
  respuesta,
  setRespuesta,
  imagen,
  setImagen,
  perfil,
  cargarDatos,
  setUsuarioSeleccionado,
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    if (imagen) {
      const formData = new FormData();
      formData.append("file", imagen);
      formData.append("userId", userId);
      await fetch("https://web-production-51989.up.railway.app/api/upload", {
        method: "POST",
        body: formData,
      });
      setImagen(null);
      return;
    }

    if (!respuesta.trim()) return;

    await fetch("https://web-production-51989.up.railway.app/api/send-to-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        message: respuesta,
        agente: {
          nombre: perfil.nombre || "",
          foto: perfil.foto || "",
          uid: localStorage.getItem("id-usuario-panel") || null,
        },
      }),
    });

    setRespuesta("");
    setUsuarioSeleccionado((prev) => ({ ...prev, intervenida: true }));
    cargarDatos();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t px-4 py-3 flex items-center gap-2 bg-white"
    >
      <label className="w-6 h-6 cursor-pointer">
        <img
          src={iconFile}
          alt="Archivo"
          className="w-full h-full opacity-60 hover:opacity-100 transition"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files[0])}
          className="hidden"
        />
      </label>

      <input
        type="text"
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        placeholder="Escribe un mensaje..."
        className={`flex-1 border rounded-full px-4 py-3 text-sm focus:outline-none transition-all duration-200 ease-in-out ${
          respuesta.trim() ? "ring-2 ring-blue-400" : ""
        }`}
        style={{ fontSize: "16px" }}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </form>
  );
};

export default FormularioRespuesta;
