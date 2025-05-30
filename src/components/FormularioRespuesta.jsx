import React, { useState } from "react";
import iconFile from "/src/assets/file.svg";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const FormularioRespuesta = ({
  userId,
  respuesta,
  setRespuesta,
  imagen,
  setImagen,
  perfil,
  cargarDatos,
  setUsuarioSeleccionado,
  todasConversaciones // ✅ Añadido para refrescar estado visual
}) => {
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!userId || enviando || (!respuesta.trim() && !imagen)) return;

  setEnviando(true);

  try {
    let imageUrl = null;

    if (imagen) {
      const formData = new FormData();
      formData.append("file", imagen);
      formData.append("userId", userId);
      formData.append("agenteUid", localStorage.getItem("id-usuario-panel") || "");

      const res = await fetch(`${BACKEND_URL}/api/upload-agente`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.imageUrl) {
        console.error("❌ Error subiendo imagen:", result);
        alert("Hubo un problema al subir la imagen.");
        setEnviando(false);
        return;
      }

      imageUrl = result.imageUrl;
    }

    if (!respuesta.trim() && !imageUrl) return;

    await fetch(`${BACKEND_URL}/api/send-to-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        message: respuesta.trim(),
        imageUrl, // ✅ incluir solo si hay imagen
        agente: {
          nombre: perfil.nombre || "",
          foto: perfil.foto || "",
          uid: localStorage.getItem("id-usuario-panel") || null,
        },
      }),
    });

    setRespuesta("");
setImagen(null);

await cargarDatos();
const actualizada = todasConversaciones.find(c => c.userId === userId);
if (actualizada) {
  setUsuarioSeleccionado(actualizada);
}
  } catch (err) {
    console.error("❌ Error en envío:", err);
  } finally {
    setEnviando(false);
  }
};

  return (
    <div className="border-t px-4 py-3 bg-white dark:bg-gray-900 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
          className={`flex-1 border rounded-full px-4 py-3 text-sm focus:outline-none transition-all duration-200 ease-in-out dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 ${
            respuesta.trim() ? "ring-2 ring-blue-400" : ""
          }`}
          style={{ fontSize: "16px" }}
        />

        <button
          type="submit"
          disabled={enviando}
          className={`bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center ${
            enviando ? "opacity-50 cursor-not-allowed" : ""
          }`}
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

      {/* Previsualización */}
      {imagen && (
        <div className="mt-3 flex items-center gap-3">
          <img
            src={URL.createObjectURL(imagen)}
            alt="Previsualización"
            className="max-h-[100px] rounded-lg border"
          />
          <button
            type="button"
            onClick={() => setImagen(null)}
            className="text-red-500 text-sm underline"
          >
            Quitar imagen
          </button>
        </div>
      )}
    </div>
  );
};

export default FormularioRespuesta;
