# WhatsApp Bank Transfer Automation 🚀

Este proyecto automatiza la extracción de datos de comprobantes bancarios (Banco Pichincha) recibidos por WhatsApp, procesándolos con Inteligencia Artificial (Google Gemini) y registrándolos automáticamente en Google Sheets.

## 🛠️ Tecnologías Utilizadas

*   **Evolution API v1.8.2**: Interfaz para conectar WhatsApp.
*   **n8n**: Motor de automatización de flujos de trabajo.
*   **Google Gemini 1.5 Flash**: IA para visión y extracción de datos.
*   **Google Sheets**: Base de datos para el registro de transferencias.
*   **Docker & Docker Compose**: Orquestación de contenedores.

## 🏗️ Arquitectura

El sistema corre localmente mediante Docker y consta de:
1.  Un Webhook que recibe el mensaje de WhatsApp.
2.  Un nodo que descarga la imagen desde Evolution API.
3.  Una petición a Gemini para convertir la imagen en JSON estructurado.
4.  Un registro automático en la hoja de cálculo de Google.

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

## ⚙️ Variables de Entorno (Docker)
*   `AUTHENTICATION_API_KEY`: 123456 (Clave para comunicación interna).
*   `SERVER_URL`: URL del servidor de Evolution API.

## 📊 Estructura del Excel
El flujo espera las siguientes columnas en la "Hoja 1":
*   Fecha
*   Monto
*   Beneficiario
*   Referencia

---
Desarrollado para la automatización de finanzas personales y empresariales.
