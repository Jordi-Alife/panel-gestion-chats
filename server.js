// server.js
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch' // Asegúrate de tenerlo instalado con: npm install node-fetch

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Server Key de Firebase Cloud Messaging (vista en tu consola de Firebase)
const SERVER_KEY = 'AAAAieDkF0g:APA91bGp0b8xUua7_QSiRd_QHLp6ZvwSRN2gq00Fm8VGk4CbquXL28qa8y-pPevdP7tC_e-EdLpxQCJ_Vjn2fTOpru6A'

app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.json())

// Endpoint para enviar notificaciones push
app.post('/api/send-notification', async (req, res) => {
  const { token, title, body } = req.body

  const mensaje = {
    to: token,
    priority: "high", // 👈 Esto mejora la velocidad de entrega
    notification: {
      title: title || "Título por defecto",
      body: body || "Contenido por defecto",
      icon: "/icon-192x192.png"
    }
  }

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Authorization": `key=${SERVER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mensaje)
    })

    const data = await response.json()
    console.log("✅ Notificación enviada:", data)
    res.status(200).json({ success: true, data })
  } catch (error) {
    console.error("❌ Error al enviar notificación:", error)
    res.status(500).json({ success: false, error })
  }
})

// Servir SPA (Single Page App)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
})
