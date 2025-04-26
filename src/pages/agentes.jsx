// src/pages/agentes.jsx
import React, { useEffect, useState } from "react";
import ModalCrearUsuario from "../components/ModalCrearUsuario";
import { escucharUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from "../firebaseDB";

const Agentes = () => {
  const [agentes, setAgentes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [agenteEditar, setAgenteEditar] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    const desuscribir = escucharUsuarios((nuevosUsuarios) => {
      setAgentes(nuevosUsuarios);
    });

    const listener = () => {
      setAgenteEditar(null);
      setMostrarModal(true);
    };
    window.addEventListener("crear-agente", listener);

    return () => {
      desuscribir();
      window.removeEventListener("crear-agente", listener);
    };
  }, []);

  const abrirEditar = (agente) => {
    setAgenteEditar(agente);
    setMostrarModal(true);
  };

  const guardarAgente = async (nuevo) => {
    try {
      if (agenteEditar) {
        await actualizarUsuario(agenteEditar.id, nuevo);
        setMensajeExito("Agente actualizado correctamente");
      } else {
        await crearUsuario(nuevo);
        setMensajeExito("Agente creado correctamente");
      }
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (error) {
      console.error("Error guardando agente:", error);
    }
  };

  const eliminarAgenteClick = async (id) => {
    if (confirm("¿Seguro que quieres eliminar este agente?")) {
      try {
        await eliminarUsuario(id);
      } catch (error) {
        console.error("Error eliminando agente:", error);
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
        {agentes.map((agente) => (
          <div
            key={agente.id}
            className="bg-white rounded-lg shadow p-4 grid grid-cols-6 gap-4 items-center text-sm"
          >
            <div className="font-medium">{agente.nombre}</div>
            <div>{agente.email}</div>
            <div>{new Date(agente.ultimaConexion).toLocaleDateString()}</div>
            <div>{agente.rol || "—"}</div>
            <div>
              <button
                onClick={() => abrirEditar(agente)}
                className="text-blue-600 text-sm hover:underline"
              >
                Editar
              </button>
            </div>
            <div>
              <button
                onClick={() => eliminarAgenteClick(agente.id)}
                className="text-red-500 text-sm hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {agentes.length === 0 && (
          <p className="text-gray-400 text-center py-6">
            No hay agentes registrados.
          </p>
        )}
      </div>

      <ModalCrearUsuario
        visible={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onCrear={guardarAgente}
        usuario={agenteEditar}
      />
    </div>
  );
};

export default Agentes;
