import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  const [data, setData] = useState([])
  const [respuesta, setRespuesta] = useState({})
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    fetch('https://web-production-51989.up.railway.app/api/conversaciones')
      .then(res => res.json())
      .then(data => {
        console.log("Conversaciones recibidas:", data)
        setData(data)
      })
      .catch(err => console.error("Error cargando datos:", err))
  }, [])

  const handleRespuesta = async (userId) => {
    if (!respuesta[userId]) return

    setEnviando(true)
    await fetch('https://web-production-51989.up.railway.app/api/send-to-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message: respuesta[userId] })
    })
    setRespuesta(prev => ({ ...prev, [userId]: '' }))
    setEnviando(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Panel de Conversaciones</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">User ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Última interacción</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Mensaje</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Responder</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-800">{item.userId}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{new Date(item.lastInteraction).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{item.message}</td>
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="text"
                      value={respuesta[item.userId] || ''}
                      onChange={e => setRespuesta(prev => ({ ...prev, [item.userId]: e.target.value }))}
                      placeholder="Escribir..."
                      className="border px-2 py-1 rounded mr-2 text-sm"
                    />
                    <button
                      onClick={() => handleRespuesta(item.userId)}
                      disabled={enviando}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-400">No hay conversaciones aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
