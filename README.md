# WhatsApp Multibanco a App Móvil 🚀

Este proyecto automatiza la extracción de datos de comprobantes bancarios (Cualquier Banco) recibidos por WhatsApp, procesándolos con Inteligencia Artificial (Google Gemini Flash) y enviándolos automáticamente a una App Móvil (Glide Apps / AppSheet / Dashboard Fuyu).

## 🛠️ Tecnologías Utilizadas

*   **Evolution API v1.8.2**: Interfaz para conectar WhatsApp.
*   **n8n**: Motor de automatización de flujos de trabajo.
*   **Google Gemini Flash (Latest)**: IA de procesamiento ultrarrápido para visión y extracción de datos.
*   **Glide Apps / AppSheet**: Frontend móvil gratuito ($0) para visualizar el panel de control y sumas diarias.
*   **Docker & Docker Compose**: Orquestación de contenedores.

## 🏗️ Arquitectura

El sistema corre localmente la extracción y se conecta a la nube para la visualización:
1.  Un Webhook que recibe el mensaje de WhatsApp.
2.  Un nodo que descarga la imagen desde Evolution API.
3.  Una petición a Gemini Flash (usando el endpoint genérico `latest`) para convertir la imagen ruidosa en JSON estructurado (Banco, Fecha, Monto, Referencia, Emisor).
4.  Un Webhook de salida hacia Glide/AppSheet para actualizar el Dashboard móvil.

## 🚀 Instalación y Configuración

### 1. Requisitos Previos
*   Docker y Docker Compose instalados.
*   Una API Key de [Google AI Studio](https://aistudio.google.com/app/apikey).
*   Una Service Account de Google Cloud con permisos de Editor en tu hoja de Sheets.

### 2. Despliegue
Clona este repositorio y ejecuta:
```bash
docker-compose up -d
```

### 3. Configuración de WhatsApp
Abre el archivo `qr.html` en tu navegador y escanea el código QR con tu aplicación de WhatsApp. La sesión se mantendrá persistente gracias a los volúmenes de Docker.

### 4. Importar Workflow
Importa el archivo `whatsapp_facturas_workflow.json` en tu instancia de n8n (`http://localhost:5678`).
*Nota: Recuerda colocar el Webhook real de tu App Glide/AppSheet en el último nodo.*

## ⚙️ Variables de Entorno (Docker)
*   `AUTHENTICATION_API_KEY`: 123456 (Clave para comunicación interna).
*   `SERVER_URL`: URL del servidor de Evolution API.

## 📱 Estructura de la App Móvil (Glide/AppSheet)
La App debe estar configurada para recibir un JSON con:
*   Banco
*   Fecha
*   Monto
*   Referencia
*   Emisor

El Dashboard móvil se encargará de realizar las sumas diarias y listar los pagos.

## 🚨 Troubleshooting / Solución de Errores Críticos

### Error 404 Not Found (Gemini API)
**Síntoma:** Al procesar un comprobante en n8n, el nodo de Gemini devuelve un error `404 - "models/gemini-1.5-flash is not found for API version v1beta"`.
**Causa:** Google depreca, actualiza o elimina modelos numerados (como la serie `1.5`) de ciertos tiers o proyectos en la consola. Al forzar un modelo numerado en la URL de la API, el servidor rechaza la petición.
**Solución Definitiva:** 
NUNCA utilices versiones numeradas en la URL del nodo HTTP de n8n (ej. ~~`models/gemini-1.5-flash`~~). Debes usar **SIEMPRE** el alias dinámico:
`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`
Esto obliga a Google a rutear la petición al mejor modelo Flash disponible sin romperse por actualizaciones de versión.

---
Desarrollado para la automatización de finanzas personales y empresariales.
