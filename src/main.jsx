// src/main.jsx
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

function MainApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    })
  }, [])

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null)
        setShowInstallButton(false)
      })
    }
  }

  return (
    <>
      <App />
      {showInstallButton && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={handleInstallClick}
            className="bg-[#ff5733] text-white px-4 py-2 rounded-full shadow-lg hover:bg-orange-600 transition"
          >
            Instalar App
          </button>
        </div>
      )}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
)

// Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registrado:', reg))
      .catch(err => console.log('Error al registrar el Service Worker:', err));
  });
}
