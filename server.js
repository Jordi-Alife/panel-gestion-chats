import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Variable en memoria para almacenar las conversaciones
const conversaciones = []

// Middleware para servir los archivos del panel (React build)
app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.json())

// Ruta principal del panel
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

// ✅ NUEVO: Obtener todos los mensajes
app.get('/api/conversaciones', (req, res) => {
  res.json(conversaciones)
})

// ✅ NUEVO: Obtener mensajes por usuario
app.get('/api/conversaciones/:userId', (req, res) => {
  const { userId } = req.params
  const mensajes = conversaciones.filter(msg => msg.userId === userId)
  res.json(mensajes)
})

// ✅ (opcional): Guardar mensajes desde otro servicio
app.post('/api/conversaciones', (req, res) => {
  const { userId, message } = req.body
  if (!userId || !message) return res.status(400).json({ error: 'Faltan campos' })

  conversaciones.push({
    userId,
    message,
    lastInteraction: new Date().toISOString()
  })

  res.json({ success: true })
})

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
})
