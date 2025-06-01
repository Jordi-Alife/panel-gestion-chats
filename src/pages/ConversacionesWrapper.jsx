import ChatMovil from "./ChatMovil";
import Conversaciones from "./Conversaciones"; // si tu archivo original sigue llamándose Conversaciones.jsx

export default function ConversacionesWrapper() {
  const isMobile = window.innerWidth < 768;
  
  return isMobile ? <ChatMovil /> : <Conversaciones />;
}
