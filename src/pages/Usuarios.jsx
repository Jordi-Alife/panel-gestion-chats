// src/pages/Usuarios.jsx
import React, { useEffect, useState } from "react";
import ModalCrearUsuario from "../components/ModalCrearUsuario";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

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
          activo: true
        },
        {
          nombre: "Carlos Ruiz",
          email: "carlos@email.com",
          ultimaConexion: "2025-04-19T09:30:00Z",
          rol: "Soporte",
          activo: true
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
    setUsuarioEditando(null);
    setMostrarModal(true);
  };

  const abrirEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setMostrarModal(true);
  };

  const guardarUsuario = (nuevo) => {
    if (usuarioEditando) {
      // Editar existente
      const actualizados = usuarios.map((u) =>
        u.email === usuarioEditando.email ? { ...u, ...nuevo } : u
      );
      setUsuarios(actualizados);
    } else {
      // Crear nuevo
      setUsuarios((prev) => [...prev, nuevo]);
    }
    setMostrarModal(false);
  };

  const eliminarUsuario = (email) => {
    if (confirm("¿Seguro que quieres eliminar este agente?")) {
      const filtrados = usuarios.filter((u) => u.email !== email);
      setUsuarios(filtrados);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Gestión de agentes</h1>

      <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-600 px-2 mb-2">
        <div>Agentes Next Lives</div>
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
                className="text-blue-600 text-sm hover:underline"
                onClick={() => abrirEditar(user)}
              >
                Editar
              </button>
            </div>
            <div>
              <button
                className="text-red-500 text-sm hover:underline"
                onClick={() => eliminarUsuario(user.email)}
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

      {/* Modal */}
      <ModalCrearUsuario
        visible={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onCrear={guardarUsuario}
        usuario={usuarioEditando}
      />
    </div>
  );
};

export default Usuarios;
