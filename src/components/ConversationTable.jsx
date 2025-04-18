export default function ConversationTable({ data, onSelect }) {
  return (
    <div className="bg-white rounded shadow">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Usuario</th>
            <th className="p-3">Última interacción</th>
            <th className="p-3">Mensaje</th>
            <th className="p-3 text-center">Ver</th>
          </tr>
        </thead>
        <tbody>
          {data.map((conv, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="p-3">{conv.userId}</td>
              <td className="p-3">{new Date(conv.lastInteraction).toLocaleString()}</td>
              <td className="p-3 truncate max-w-[300px]">{conv.message}</td>
              <td className="p-3 text-center">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => onSelect(conv.userId)}
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
