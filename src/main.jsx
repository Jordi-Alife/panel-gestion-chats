// src/main.jsx
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { messaging, getToken, onMessage } from './firebase.js'

function MainApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    // Instalación como PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    })
  }, [])

  useEffect(() => {
    // Solicitud de permiso para notificaciones
    Notification.requestPermission().then((permiso) => {
      if (permiso === 'granted') {
        getToken(messaging, {
          vapidKey: "BGb0b8xUua7_QSiRd_QHLdPzVwSRN2gg00FM8vGk4CbquXL28qa8y-pPevdP7tC_e-EdLpxQCJ_Vjn2fT0pru6A"
        })
        .then((currentToken) => {
          if (currentToken) {
            console.log('Token FCM:', currentToken)
          } else {
            console.warn('No se obtuvo token FCM')
          }
        })
        .catch((err) => {
          console.error('Error al obtener el token FCM:', err)
        })

        // Recepción de notificaciones en primer plano
        onMessage(messaging, (payload) => {
          console.log('Notificación en primer plano:', payload)
          if (Notification.permission === 'granted') {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: '/icon-192x192.png'
            })
          }
        })
      }
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
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(reg => console.log('Service Worker registrado:', reg))
      .catch(err => console.log('Error al registrar el Service Worker:', err))
  })
}
