import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Servir archivos estáticos desde /dist
app.use(express.static(path.join(__dirname, 'dist')))

// Redirigir todo lo demás a index.html (para React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`)
})
