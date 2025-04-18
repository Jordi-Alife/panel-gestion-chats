import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch('https://web-production-51989.up.railway.app/api/conversaciones')
      .then(res => res.json())
      .then(data => {
        console.log("Conversaciones recibidas:", data)
        setData(data)
      })
      .catch(err => console.error("Error cargando datos:", err))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Panel de Conversaciones</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">User ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Última interacción</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Mensaje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-800">{item.userId}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{new Date(item.lastInteraction).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{item.message}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-400">No hay conversaciones aún.</td>
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
