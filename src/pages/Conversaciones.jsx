import { useEffect, useRef, useState } from 'react';

export default function Conversaciones() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const [imagen, setImagen] = useState(null);
  const [originalesVisibles, setOriginalesVisibles] = useState({});
  const [todasConversaciones, setTodasConversaciones] = useState([]);
  const [vistas, setVistas] = useState({});
  const [mostrarScrollBtn, setMostrarScrollBtn] = useState(false);
  const chatRef = useRef(null);
  const scrollForzado = useRef(true);
