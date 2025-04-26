// src/pages/Perfil.jsx
import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { app } from "../firebaseAuth"; // usamos la misma app

const Perfil = () => {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Administrador");
  const [foto, setFoto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [rolUsuario, setRolUsuario] = useState("Soporte");
  const navigate = useNavigate();

  useEffect(() => {
    const guardado = localStorage.getItem("perfil-usuario-panel");
    const rolGuardado = localStorage.getItem("rol-usuario-panel");

    if (guardado) {
      const datos = JSON.parse(guardado);
      setNombre(datos.nombre || "");
      setUsuario(datos.usuario || "");
      setEmail(datos.email || "");
      setRol(datos.rol || "Administrador");
      setFoto(datos.foto || "");
    }

    if (rolGuardado) {
      setRolUsuario(rolGuardado);
    }
  }, []);

  const guardarCambios = async () => {
    setCargando(true);

    const perfilActualizado = { nombre, usuario, email, rol, foto };
    localStorage.setItem("perfil-usuario-panel", JSON.stringify(perfilActualizado));
    window.dispatchEvent(new Event("actualizar-foto-perfil"));

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore(app);
        const agenteRef = doc(db, "agentes", user.uid);

        await updateDoc(agenteRef, {
          nombre: nombre || "",
          foto: foto || "",
        });
        console.log("✅ Perfil actualizado en Firestore.");
      }
      setMensaje("Cambios guardados correctamente.");
    } catch (error) {
      console.error("❌ Error actualizando perfil en Firestore:", error);
      setMensaje("Error guardando cambios.");
    }

    setTimeout(() => {
      setMensaje("");
      setCargando(false);
    }, 1500);
  };

  const manejarCambioFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onloadend = () => {
        setFoto(lector.result);
      };
      lector.readAsDataURL(archivo);
    }
  };

  const cerrarSesion = async () => {
    const confirmar = window.confirm("¿Seguro que quieres cerrar sesión?");
    if (!confirmar) return;

    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem("perfil-usuario-panel");
      localStorage.removeItem("rol-usuario-panel");
      navigate("/login");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Mi perfil</h1>

      {mensaje && (
        <div className="mb-4 text-green-600 text-sm font-medium">{mensaje}</div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-4 max-w-xl">
        {/* Foto de perfil */}
        <div className="flex flex-col items-center space-y-2">
          {foto ? (
            <img src={foto} alt="Foto de perfil" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
              Sin foto
            </div>
          )}
          <label className="cursor-pointer text-blue-600 text-sm underline">
            Cambiar foto
            <input
              type="file"
              accept="image/*"
              onChange={manejarCambioFoto}
              className="hidden"
            />
          </label>
        </div>

        {/* Datos del perfil */}
        <div>
          <label className="block text-sm font-semibold mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled={rolUsuario !== "Administrador"}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
          />
          {rolUsuario !== "Administrador" && (
            <p className="text-xs text-gray-400 mt-1">Solo los administradores pueden cambiar el email.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Rol</label>
          <input
            type="text"
            value={rol}
            disabled
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2 pt-4">
          <button
            onClick={guardarCambios}
            disabled={cargando}
            className="bg-[#FF5C42] hover:bg-[#e04c35] text-white px-4 py-2 rounded text-sm"
          >
            {cargando ? "Guardando..." : "Guardar cambios"}
          </button>

          <button
            onClick={cerrarSesion}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
