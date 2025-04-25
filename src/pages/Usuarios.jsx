// src/pages/Usuarios.jsx
import React, { useEffect, useState } from "react";
import ModalCrearUsuario from "../components/ModalCrearUsuario";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modo, setModo] = useState("crear"); // 'crear' o 'editar'
  const [usuarioEditando, setUsuarioEditando] = useState(null); // Datos del usuario que se edita

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
      const texto = e.target.innerText;
      if (texto === "Crear usuario" || texto === "Crear agente") {
        e.preventDefault();
        setModo("crear");
        setUsuarioEditando(null);
        setMostrarModal(true);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const agregarUsuario = (nuevo) => {
    if (!nuevo.rol) nuevo.rol = "Administrador";
    if (modo === "crear") {
      setUsuarios((prev) => [...prev, nuevo]);
      console.log("Usuario creado:", nuevo);
    } else if (modo === "editar" && usuarioEditando !== null) {
      const actualizados = usuarios.map((u, idx) =>
        idx === usuarioEditando ? { ...u, ...nuevo } : u
      );
      setUsuarios(actualizados);
      console.log("Usuario editado:", nuevo);
    }
  };

  const abrirEditar = (index) => {
    setModo("editar");
    setUsuarioEditando(index);
    setMostrarModal(true);
  };

  const eliminarUsuario = (index) => {
    const nuevos = [...usuarios];
    nuevos.splice(index, 1);
    setUsuarios(nuevos);
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
                onClick={() => abrirEditar(i)}
                className="text-blue-600 text-sm hover:underline"
              >
                Editar
              </button>
            </div>
            <div>
              <button
                onClick={() => eliminarUsuario(i)}
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
        onCrear={agregarUsuario}
        modo={modo}
        usuario={usuarioEditando !== null ? usuarios[usuarioEditando] : null}
      />
    </div>
  );
};

export default Usuarios;
