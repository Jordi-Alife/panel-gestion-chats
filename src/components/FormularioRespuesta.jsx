import React from "react";

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
    <form onSubmit={handleSubmit} className="border-t px-4 py-3 flex items-center gap-2">
      <label className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 transition">
        Seleccionar archivo
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files[0])}
          className="hidden"
        />
      </label>

      {imagen && (
        <div className="text-xs text-gray-600 flex items-center gap-1">
          <span>{imagen.name}</span>
          <button
            type="button"
            onClick={() => setImagen(null)}
            className="text-red-500 text-xs underline"
          >
            Quitar
          </button>
        </div>
      )}

      <input
        type="text"
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        placeholder="Escribe un mensaje..."
        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none"
      />

      <button
        type="submit"
        className="bg-[#ff5733] text-white rounded-full px-4 py-2 text-sm hover:bg-orange-600"
      >
        Enviar
      </button>
    </form>
  );
};

export default FormularioRespuesta;
