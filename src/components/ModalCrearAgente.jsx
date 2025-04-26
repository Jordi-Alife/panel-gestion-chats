// src/components/ModalCrearAgente.jsx
import React, { useEffect, useState } from "react";
import { invitarAgente, app } from "../firebaseAuth"; // <- usamos invitarAgente, no invitarUsuario
import { getFirestore, collection, addDoc } from "firebase/firestore";

const ModalCrearAgente = ({ visible, onClose, onCrear, agente }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Administrador");
  const [activo, setActivo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (agente) {
      setNombre(agente.nombre || "");
      setEmail(agente.email || "");
      setRol(agente.rol || "Administrador");
      setActivo(agente.activo ?? false);
    } else {
      setNombre("");
      setEmail("");
      setRol("Administrador");
      setActivo(false);
    }
  }, [agente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const nuevoAgente = {
      nombre,
      email,
      ultimaConexion: new Date().toISOString(),
      rol,
      activo,
    };

    try {
      if (!agente && activo) {
        await invitarAgente(email, { nombre, rol, activo });
        console.log(`✅ Invitación enviada a ${email}`);
      }

      // Guardar también en Firestore (colección agentes)
      const db = getFirestore(app);
      await addDoc(collection(db, "agentes"), nuevoAgente);
      console.log("✅ Agente guardado en Firestore");
    } catch (err) {
      console.error("❌ Error creando agente:", err);
    }

    setTimeout(() => {
      onCrear(nuevoAgente);
      setGuardando(false);
      onClose();
    }, 500);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4">{agente ? "Editar agente" : "Crear agente"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              className="w-full border px-4 py-2 rounded"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border px-4 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!agente}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              className="w-full border px-4 py-2 rounded"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option>Administrador</option>
              <option>Editor</option>
              <option>Soporte</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="activo" className="text-sm">Activar agente</label>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-4 py-2 rounded bg-[#ff5733] hover:bg-orange-600 text-white text-sm"
            >
              {guardando ? "Guardando..." : agente ? "Guardar cambios" : "Crear agente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearAgente;
