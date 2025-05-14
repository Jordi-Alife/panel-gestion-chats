// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ✅ Activar clase "dark" si está activado en localStorage
const dark = localStorage.getItem("modo-oscuro") === "true"
if (dark) {
  document.documentElement.classList.add("dark")
} else {
  document.documentElement.classList.remove("dark")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
