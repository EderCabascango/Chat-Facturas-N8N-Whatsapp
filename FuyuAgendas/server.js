const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const CITAS_FILE = path.join(DATA_DIR, 'citas.json');
const CLIENTES_FILE = path.join(DATA_DIR, 'clientes.json');
const API_KEY = 'fuyu_prod_secret_2026';

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(CITAS_FILE)) fs.writeFileSync(CITAS_FILE, '[]');
if (!fs.existsSync(CLIENTES_FILE)) fs.writeFileSync(CLIENTES_FILE, '[]');

const authenticate = (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (key === API_KEY) return next();
    res.status(401).json({ error: 'No autorizado' });
};

// --- WEBHOOK: RECEPCIÓN DE CITAS (CHATBOT) ---
app.post('/api/webhook/citas', authenticate, (req, res) => {
    try {
        const citas = JSON.parse(fs.readFileSync(CITAS_FILE, 'utf8'));
        const newCita = { 
            id: Date.now().toString(),
            cliente: req.body.cliente,
            fecha: req.body.fecha,
            hora: req.body.hora,
            servicio: req.body.servicio
        };
        citas.push(newCita);
        fs.writeFileSync(CITAS_FILE, JSON.stringify(citas, null, 2));

        // Registro Automático de Paciente si es nuevo
        const clientes = JSON.parse(fs.readFileSync(CLIENTES_FILE, 'utf8'));
        let cliente = clientes.find(c => c.nombre === req.body.cliente);
        
        if (!cliente) {
            cliente = {
                id: 'c' + Date.now(),
                nombre: req.body.cliente,
                telefono: req.body.telefono || 'Sin registrar',
                ultima_cita: req.body.fecha,
                total_visitas: 1,
                historial: [{
                    fecha: req.body.fecha,
                    motivo: req.body.servicio,
                    notas: 'Cita agendada vía WhatsApp / Chatbot.'
                }]
            };
            clientes.push(cliente);
        } else {
            cliente.total_visitas = (cliente.total_visitas || 0) + 1;
            cliente.ultima_cita = req.body.fecha;
            cliente.historial.push({
                fecha: req.body.fecha,
                motivo: req.body.servicio,
                notas: 'Cita recurrente agendada vía WhatsApp.'
            });
        }
        fs.writeFileSync(CLIENTES_FILE, JSON.stringify(clientes, null, 2));
        
        res.json({ status: 'success', message: 'Cita y Hoja de Vida actualizadas' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno al procesar cita' });
    }
});

app.get('/api/citas', authenticate, (req, res) => {
    res.json(JSON.parse(fs.readFileSync(CITAS_FILE, 'utf8')));
});

app.get('/api/clientes', authenticate, (req, res) => {
    res.json(JSON.parse(fs.readFileSync(CLIENTES_FILE, 'utf8')));
});

app.listen(PORT, () => {
    console.log(`🚀 FUYU AGENDA PROFESIONAL ACTIVO EN: http://localhost:${PORT}`);
});
