import React, { useEffect, useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import ConversationTable from "./components/ConversationTable";

export default function App() {
  const [data, setData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch("https://web-production-51989.up.railway.app/api/conversaciones")
      .then((res) => res.json())
      .then(setData);
  }, []);

  const totals = {
    recibidos: data.length,
    enviados: data.filter(m => m.origen === "panel").length,
    total: data.length,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Panel de Conversaciones</h1>
      <DashboardHeader totals={totals} />
      <ConversationTable data={data} onSelect={setSelectedUser} />
    </div>
  );
}
