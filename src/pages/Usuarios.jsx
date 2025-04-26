// src/pages/Usuarios.jsx
import React, { useEffect, useState } from "react";
import ModalCrearUsuario from "../components/ModalCrearUsuario";
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, escucharUsuarios } from "../firebaseDB"; // actualizado

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    // Escuchar usuarios en tiempo real
    const cancelar = escucharUsuarios((nuevaLista) => {
      setUsuarios(nuevaLista);
    });

    const listener = () => {
      setUsuarioEditar(null);
      setMostrarModal(true);
    };
    window.addEventListener("crear-agente", listener);

    return () => {
      cancelar(); // detener escucha
      window.removeEventListener("crear-agente", listener);
    };
  }, []);

  const abrirEditar = (usuario) => {
    setUsuarioEditar(usuario);
    setMostrarModal(true);
  };

  const guardarUsuario = async (nuevo) => {
    try {
      if (usuarioEditar) {
        await actualizarUsuario(usuarioEditar.id, nuevo);
        setMensajeExito("Agente actualizado correctamente");
      } else {
        await crearUsuario(nuevo);
        setMensajeExito("Agente creado correctamente");
      }
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (error) {
      console.error("Error guardando usuario:", error);
    }
  };

  const eliminarUsuarioClick = async (id) => {
    if (confirm("¿Seguro que quieres eliminar este agente?")) {
      try {
        await eliminarUsuario(id);
      } catch (error) {
        console.error("Error eliminando usuario:", error);
      }
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
        {usuarios.map((user) => (
          <div
            key={user.id}
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
                onClick={() => eliminarUsuarioClick(user.id)}
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
