// src/pages/Usuarios.jsx
import React, { useEffect, useState } from "react";
import ModalCrearUsuario from "../components/ModalCrearUsuario";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    const guardados = localStorage.getItem("usuarios-panel");
    if (guardados) {
      setUsuarios(JSON.parse(guardados));
    } else {
      const porDefecto = [
        {
          nombre: "Laura Pérez",
          email: "laura@email.com",
          ultimaConexion: "2025-04-20T12:00:00Z",
          rol: "Administrador",
          activo: true,
        },
        {
          nombre: "Carlos Ruiz",
          email: "carlos@email.com",
          ultimaConexion: "2025-04-19T09:30:00Z",
          rol: "Administrador",
          activo: false,
        },
      ];
      setUsuarios(porDefecto);
      localStorage.setItem("usuarios-panel", JSON.stringify(porDefecto));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("usuarios-panel", JSON.stringify(usuarios));
  }, [usuarios]);

  const abrirCrear = () => {
    setUsuarioEditar(null);
    setMostrarModal(true);
  };

  const abrirEditar = (user) => {
    setUsuarioEditar(user);
    setMostrarModal(true);
  };

  const guardarUsuario = (nuevo) => {
    if (usuarioEditar) {
      // Editar
      const actualizados = usuarios.map((u) =>
        u.email === usuarioEditar.email ? { ...u, ...nuevo } : u
      );
      setUsuarios(actualizados);
      setMensajeExito("Agente actualizado correctamente");
    } else {
      // Crear nuevo
      setUsuarios((prev) => [...prev, nuevo]);
      setMensajeExito("Agente creado correctamente");
    }
    setTimeout(() => setMensajeExito(""), 3000);
  };

  const eliminarUsuario = (email) => {
    if (confirm("¿Seguro que quieres eliminar este agente?")) {
      setUsuarios((prev) => prev.filter((u) => u.email !== email));
    }
  };

  return (
    <div className="relative">
      <h1 className="text-xl font-bold mb-4">Gestión de agentes</h1>

      {mensajeExito && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-sm px-4 py-2 rounded shadow">
          {mensajeExito}
        </div>
      )}

      <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-600 px-2 mb-2">
        <div>Agente</div>
        <div>Email</div>
        <div>Última conexión</div>
        <div>Rol</div>
        <div>Editar</div>
        <div>Eliminar</div>
      </div>

      <div className="grid gap-4">
        {usuarios.map((user, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 grid grid-cols-6 gap-4 items-center text-sm"
          >
            <div className="font-medium">{user.nombre}</div>
            <div>{user.email}</div>
            <div>{new Date(user.ultimaConexion).toLocaleDateString()}</div>
            <div>{user.rol || "—"}</div>
            <div>
              <button
                onClick={() => abrirEditar(user)}
                className="text-blue-600 text-sm hover:underline"
              >
                Editar
              </button>
            </div>
            <div>
              <button
                onClick={() => eliminarUsuario(user.email)}
                className="text-red-500 text-sm hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {usuarios.length === 0 && (
          <p className="text-gray-400 text-center py-6">
            No hay agentes registrados.
          </p>
        )}
      </div>

      <ModalCrearUsuario
        visible={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onCrear={guardarUsuario}
        usuario={usuarioEditar}
      />
    </div>
  );
};

export default Usuarios;
