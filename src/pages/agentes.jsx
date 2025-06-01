import React, { useEffect, useState } from "react";
import ModalCrearAgente from "../components/ModalCrearAgente";
import { escucharAgentes, crearAgente, actualizarAgente, eliminarAgente } from "../firebaseDB";
import { useNavigate } from "react-router-dom";

const Agentes = () => {
  const [agentes, setAgentes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [agenteEditar, setAgenteEditar] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [rolUsuario, setRolUsuario] = useState("Soporte");
  const navigate = useNavigate();

  useEffect(() => {
  const cargar = async () => {
    const respuesta = await obtenerAgentes();
    setAgentes(respuesta);
  };

  cargar();
}, []);

  const abrirEditar = (agente) => {
    setAgenteEditar(agente);
    setMostrarModal(true);
  };

  const guardarAgente = async (nuevo) => {
    try {
      if (agenteEditar) {
        await actualizarAgente(agenteEditar.id, {
          ...nuevo,
          ultimaConexion: new Date().toISOString(),
        });
        setMensajeExito("Agente actualizado correctamente");
      } else {
        await crearAgente({
          ...nuevo,
          ultimaConexion: new Date().toISOString(),
        });
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
        await eliminarAgente(id);
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

      {/* Contenedor tabla */}
      <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow p-6">
  {/* Cabecera */}
  <div className="grid grid-cols-[1.6fr,2fr,1.5fr,1.2fr,1.5fr,auto,auto] gap-6 items-center text-xs text-gray-500 font-semibold uppercase py-2 border-b">
    <div className="pl-6">Foto/Nombre</div>
    <div className="pl-8">Email</div>
    <div className="pl-7">Última conexión</div>
    <div className="pl-6">Rol</div>
    <div className="pl-6">Notificaciones SMS</div>
    <div className="text-center">Editar</div>
    <div className="text-center">Eliminar</div>
  </div>

        {/* Lista de agentes */}
        <div className="divide-y">
          {agentes.map((agente) => (
            <div
              key={agente.id}
              className="grid grid-cols-[1.6fr,2fr,1.5fr,1.2fr,1.5fr,auto,auto] gap-6 items-center text-sm text-gray-700 py-3"
            >
              {/* Foto y Nombre */}
              <div
                className="flex items-center gap-4 pl-6 cursor-pointer hover:underline"
                onClick={() => navigate(`/agente/${agente.id}`)}
                title="Ver detalle del agente"
              >
                {agente.foto ? (
                  <img
                    src={agente.foto}
                    alt={agente.nombre}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                    {agente.nombre?.charAt(0) || "?"}
                  </div>
                )}
                <span className="truncate">{agente.nombre}</span>
              </div>

              {/* Email */}
              <div className="pl-8 truncate">{agente.email}</div>

              {/* Última conexión */}
              <div className="pl-7 text-gray-500">
                {agente.ultimaConexion ? new Date(agente.ultimaConexion).toLocaleDateString() : "—"}
              </div>

              {/* Rol */}
              <div className="pl-6 text-gray-500">{agente.rol || "—"}</div>

              {/* Notificaciones SMS */}
              <div className="pl-6 text-gray-500">
                {agente.notificarSMS ? "Sí" : "No"}
              </div>

              {/* Editar */}
              <div className="flex justify-center">
                {(rolUsuario === "Administrador" || rolUsuario === "Editor") && (
                  <button
                    onClick={() => abrirEditar(agente)}
                    className="hover:text-blue-600 transition"
                    title="Editar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Eliminar */}
              <div className="flex justify-center">
                {rolUsuario === "Administrador" && (
                  <button
                    onClick={() => eliminarAgenteClick(agente.id)}
                    className="hover:text-red-500 transition ml-4"
                    title="Eliminar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v2H9V4a1 1 0 011-1z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
          {agentes.length === 0 && (
            <p className="text-gray-400 text-center py-6">
              No hay agentes registrados.
            </p>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Agente */}
      <ModalCrearAgente
        visible={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onCrear={guardarAgente}
        agente={agenteEditar}
      />
    </div>
  );
};

export default Agentes;
