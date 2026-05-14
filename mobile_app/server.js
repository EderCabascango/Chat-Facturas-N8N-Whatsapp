const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public', {
    etag: false,
    maxAge: 0,
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_FILE = path.join(DB_DIR, 'facturas.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

const API_KEY = process.env.API_KEY || 'fuyu_prod_secret_2026';

// Middleware de seguridad
const authenticate = (req, res, next) => {
    const key = req.headers['x-api-key'] || req.query.api_key;
    if (key === API_KEY) {
        return next();
    }
    res.status(401).json({ error: 'No autorizado. Se requiere API KEY válida.' });
};

// Webhook para n8n (Protegido)
app.post('/api/webhook', authenticate, (req, res) => {
    try {
        let newData = req.body;
        // Si los datos vienen envueltos en un objeto 'body' (típico de n8n), los sacamos
        if (newData.body && typeof newData.body === 'object') {
            newData = newData.body;
        }

        console.log("Nueva factura procesada:", newData);
        
        const data = JSON.parse(fs.readFileSync(DB_FILE));
        
        const factura = {
            id: Date.now().toString(),
            banco: newData.Banco || newData.banco || "Desconocido",
            fecha: newData.Fecha || newData.fecha || new Date().toLocaleDateString(),
            monto: parseFloat(newData.Monto || newData.monto || 0),
            referencia: newData["Número de Comprobante"] || newData.referencia || "-",
            emisor: newData["Nombre del Emisor"] || newData.emisor || "Desconocido",
            timestamp: new Date().toISOString()
        };
        
        data.unshift(factura);
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        
        res.status(200).json({ success: true, message: "Factura guardada" });
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API para el frontend (Protegida)
app.get('/api/facturas', authenticate, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DB_FILE));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Mobile App Backend PROTEGIDO corriendo en http://localhost:${PORT}`);
});
