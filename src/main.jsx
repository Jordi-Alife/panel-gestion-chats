import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch('/src/data.json')
      .then(res => res.json())
      .then(setData)
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
