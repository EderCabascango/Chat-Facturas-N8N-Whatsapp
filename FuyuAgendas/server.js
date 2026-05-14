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
const API_KEY = process.env.API_KEY || 'fuyu_prod_secret_2026';

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(CITAS_FILE)) fs.writeFileSync(CITAS_FILE, '[]');
if (!fs.existsSync(CLIENTES_FILE)) fs.writeFileSync(CLIENTES_FILE, '[]');

const authenticate = (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (key === API_KEY) return next();
    res.status(401).json({ error: 'No autorizado' });
};

// Helper: leer/escribir JSON
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// --- CREAR CITA (Webhook del chatbot) ---
app.post('/api/webhook/citas', authenticate, (req, res) => {
    try {
        const citas = readJSON(CITAS_FILE);
        const newCita = { 
            id: Date.now().toString(),
            cedula: req.body.cedula || 'N/A',
            cliente: req.body.cliente,
            telefono: req.body.telefono || 'Sin registrar',
            fecha: req.body.fecha,
            hora: req.body.hora,
            servicio: req.body.servicio,
            estado: 'confirmada',
            createdAt: new Date().toISOString()
        };
        citas.push(newCita);
        writeJSON(CITAS_FILE, citas);

        // Registro Automático de Paciente si es nuevo
        const clientes = readJSON(CLIENTES_FILE);
        let cliente = clientes.find(c => (c.cedula && c.cedula === req.body.cedula) || c.nombre === req.body.cliente);
        
        if (!cliente) {
            cliente = {
                id: 'c' + Date.now(),
                cedula: req.body.cedula || 'N/A',
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
        writeJSON(CLIENTES_FILE, clientes);
        
        res.json({ status: 'success', message: 'Cita registrada exitosamente', cita: newCita });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error interno al procesar cita' });
    }
});

// --- CONSULTAR CITAS (con filtro por teléfono o cliente) ---
app.get('/api/citas', authenticate, (req, res) => {
    try {
        let citas = readJSON(CITAS_FILE);
        
        // Filtro por teléfono
        if (req.query.telefono) {
            citas = citas.filter(c => c.telefono === req.query.telefono);
        }
        // Filtro por nombre de cliente
        if (req.query.cliente) {
            citas = citas.filter(c => 
                c.cliente && c.cliente.toLowerCase().includes(req.query.cliente.toLowerCase())
            );
        }
        // Filtro por estado
        if (req.query.estado) {
            citas = citas.filter(c => c.estado === req.query.estado);
        }
        // Solo citas activas (no canceladas) por defecto
        if (!req.query.estado) {
            citas = citas.filter(c => c.estado !== 'cancelada');
        }
        
        res.json({ total: citas.length, citas });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error al consultar citas' });
    }
});

// --- EDITAR CITA ---
app.put('/api/citas/:id', authenticate, (req, res) => {
    try {
        const citas = readJSON(CITAS_FILE);
        const idx = citas.findIndex(c => c.id === req.params.id);
        
        if (idx === -1) {
            return res.status(404).json({ error: 'Cita no encontrada con ese ID' });
        }
        
        // Actualizar solo los campos proporcionados
        if (req.body.fecha) citas[idx].fecha = req.body.fecha;
        if (req.body.hora) citas[idx].hora = req.body.hora;
        if (req.body.servicio) citas[idx].servicio = req.body.servicio;
        if (req.body.cliente) citas[idx].cliente = req.body.cliente;
        if (req.body.telefono) citas[idx].telefono = req.body.telefono;
        citas[idx].updatedAt = new Date().toISOString();
        
        writeJSON(CITAS_FILE, citas);
        res.json({ status: 'success', message: 'Cita actualizada', cita: citas[idx] });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error al editar cita' });
    }
});

// --- CANCELAR CITA ---
app.delete('/api/citas/:id', authenticate, (req, res) => {
    try {
        const citas = readJSON(CITAS_FILE);
        const idx = citas.findIndex(c => c.id === req.params.id);
        
        if (idx === -1) {
            return res.status(404).json({ error: 'Cita no encontrada con ese ID' });
        }
        
        citas[idx].estado = 'cancelada';
        citas[idx].cancelledAt = new Date().toISOString();
        
        writeJSON(CITAS_FILE, citas);
        res.json({ status: 'success', message: 'Cita cancelada exitosamente', cita: citas[idx] });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error al cancelar cita' });
    }
});

// --- CLIENTES ---
app.get('/api/clientes', authenticate, (req, res) => {
    res.json(readJSON(CLIENTES_FILE));
});

app.listen(PORT, () => {
    console.log(`🚀 FUYU AGENDA PROFESIONAL ACTIVO EN: http://localhost:${PORT}`);
});
