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
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Panel Conversaciones</h1>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ marginTop: '1rem', width: '100%' }}>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Última interacción</th>
            <th>Mensaje</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{item.userId}</td>
              <td>{item.lastInteraction}</td>
              <td>{item.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
