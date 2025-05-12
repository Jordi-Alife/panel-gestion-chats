import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InicioRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const esMovil = window.innerWidth < 768;
    if (esMovil) {
      navigate("/conversaciones-movil", { replace: true });
    } else {
      navigate("/conversaciones", { replace: true });
    }
  }, [navigate]);

  return null;
};

export default InicioRedirect;
