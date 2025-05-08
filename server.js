import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import fs from 'fs';
import OpenAI from 'openai';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// ✅ Tomamos las credenciales desde la variable de entorno
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SERVER_KEY = 'AAAAieDkF0g:APA91bGp0b8xUua7_QSiRd_QHLp6ZvwSRN2gq00Fm8VGk4CbquXL28qa8y-pPevdP7tC_e-EdLpxQCJ_Vjn2fTOpru6A';

app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));
app.use(express.json());

// ✅ Enviar notificación push
app.post('/api/send-notification', async (req, res) => {
  const { token, title, body } = req.body;

  const mensaje = {
    to: token,
    priority: "high",
    notification: {
      title: title || "Título por defecto",
      body: body || "Contenido por defecto",
      icon: "/icon-192x192.png",
    },
  };

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization: `key=${SERVER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mensaje),
    });

    const data = await response.json();
    console.log("✅ Notificación enviada:", data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Error al enviar notificación:", error);
    res.status(500).json({ success: false, error });
  }
});

// ✅ Endpoint de monitor
app.get('/api/status', async (req, res) => {
  const status = {
    backend: {
      status: "✅ OK",
      port: port,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    firestore: null,
    openai: null,
    lastImageUpload: null,
  };

  try {
    await db.collection('test_status').doc('ping').set({ time: Date.now() }, { merge: true });
    status.firestore = "✅ Conectado";
  } catch (e) {
    status.firestore = "❌ Error: " + e.message;
  }

  try {
    await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: "Di 'pong'" }],
    });
    status.openai = "✅ Respuesta recibida";
  } catch (e) {
    status.openai = "❌ Error: " + e.message;
  }

  try {
    const files = fs.readdirSync('./uploads');
    const latest = files.sort((a, b) =>
      fs.statSync(`./uploads/${b}`).mtime - fs.statSync(`./uploads/${a}`).mtime
    )[0];
    status.lastImageUpload = latest ? `✅ Última imagen: ${latest}` : "⚠ No hay imágenes recientes";
  } catch (e) {
    status.lastImageUpload = "❌ Error leyendo imágenes";
  }

  res.json(status);
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
