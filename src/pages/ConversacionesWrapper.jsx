import { lazy, Suspense } from "react";

const ChatMovil = lazy(() => import("./ChatMovil"));
const Conversaciones = lazy(() => import("./Conversaciones")); // escritorio

export default function ConversacionesWrapper() {
  const isMobile = window.innerWidth < 768;

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      {isMobile ? <ChatMovil /> : <Conversaciones />}
    </Suspense>
  );
}
