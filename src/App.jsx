import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import Conversaciones from "./pages/Conversaciones";
import Agentes from "./pages/agentes";
import Perfil from "./pages/Perfil";
import Login from "./pages/Login";
import Notificaciones from "./components/Notificaciones";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "./firebaseAuth";

const App = () => {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUsuarioActual(user);
      setCargandoAuth(false);

      if (user) {
        try {
          const db = getFirestore(app);
          const agenteRef = doc(db, "agentes", user.uid);
          const agenteSnap = await getDoc(agenteRef);

          if (agenteSnap.exists()) {
            const datos = agenteSnap.data();
            localStorage.setItem("id-usuario-panel", user.uid);
            localStorage.setItem("rol-usuario-panel", datos.rol || "Soporte");
            localStorage.setItem(
              "perfil-usuario-panel",
              JSON.stringify({
                nombre: datos.nombre || "",
                email: datos.email || user.email,
                foto: datos.foto || "",
                rol: datos.rol || "Soporte",
              })
            );

            window.dispatchEvent(new Event("actualizar-foto-perfil"));
          }
        } catch (error) {
          console.error("❌ Error obteniendo perfil del agente:", error);
        }
      }
    });
    return () => unsub();
  }, []);

  // ✅ Notificaciones globales desde cualquier ruta
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://web-production-51989.up.railway.app/api/conversaciones")
        .then((res) => res.json())
        .then((convs) => {
          fetch("https://web-production-51989.up.railway.app/api/vistas")
            .then((res) => res.json())
            .then((vistas) => {
              const total = convs.reduce((acc, c) => {
                const vista = vistas[c.userId];
                const nuevos = (c.mensajes || []).filter(
                  (m) =>
                    m.from?.toLowerCase() === "usuario" &&
                    (!vista || new Date(m.lastInteraction) > new Date(vista))
                ).length;
                return nuevos > 0 ? acc + 1 : acc;
              }, 0);
              window.dispatchEvent(
                new CustomEvent("notificaciones-nuevas", {
                  detail: { total },
                })
              );
            });
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (cargandoAuth) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            usuarioActual ? (
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/conversaciones" />} />
                  <Route path="/conversaciones" element={<Conversaciones />} />
                  <Route path="/agentes" element={<Agentes />} />
                  <Route path="/perfil" element={<Perfil />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
