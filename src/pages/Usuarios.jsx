import React, { useEffect, useState } from "react";
import ModalCrearUsuario from "../components/ModalCrearUsuario";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

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
          rol: "Administrador"
        },
        {
          nombre: "Carlos Ruiz",
          email: "carlos@email.com",
          ultimaConexion: "2025-04-19T09:30:00Z",
          rol: "Administrador"
        },
      ];
      setUsuarios(porDefecto);
      localStorage.setItem("usuarios-panel", JSON.stringify(porDefecto));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("usuarios-panel", JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    const handleClick = (e) => {
      const esBotonCrear = e.target.innerText === "Crear usuario" || e.target.innerText === "Crear agente";
      if (esBotonCrear) {
        e.preventDefault();
        setMostrarModal(true);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const agregarUsuario = (nuevo) => {
    // Añadir rol por defecto si no lo trae
    if (!nuevo.rol) nuevo.rol = "Administrador";
    setUsuarios((prev) => [...prev, nuevo]);
    console.log("Usuario creado:", nuevo);
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
              <button className="text-blue-600 text-sm hover:underline">
                Editar
              </button>
            </div>
            <div>
              <button className="text-red-500 text-sm hover:underline">
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
        onCrear={agregarUsuario}
      />
    </div>
  );
};

export default Usuarios;
