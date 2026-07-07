# 🎮 RetroPixel 2000 (v2.0)

**RetroPixel** es una plataforma de preservación digital de la era dorada del PC Gaming (1997-2007). Construida con tecnologías web de última generación para ofrecer una experiencia inmersiva, nostálgica y técnica.

---

## 🚀 Experiencia Explosiva

- 🏎️ **Mundo Tron 3D**: Fondo interactivo construido con `Three.js` y `React Three Fiber`.
- 👾 **Protocolo de Defensa**: Un Shooter Espacial procedural integrado para cuando no hay resultados o para retar al sistema.
- 🏆 **Ranking Global**: Sistema de puntuación en tiempo real con autenticación de Google.
- 💾 **Cloud Database**: Catálogo gestionado mediante `Firebase Firestore` con sincronización en vivo.
- 📺 **Estética Retro-Futurista**: Interfaz CRT con efectos de neón, glitch y animaciones de entrada dinámicas.

---

## 📖 Biblia del Desarrollador (Documentación)

Para entender profundamente la arquitectura y escalabilidad del proyecto, consulta los siguientes capítulos:

1. [🏗️ Arquitectura Full-Stack](./docs/01-architecture.md) - React + Vite + Firestore.
2. [🎨 Experiencia 3D y Sonido](./docs/02-animations-3d.md) - Tron Shooter y Audio Sintetizado.
3. [💰 Cloud y Estrategia](./docs/03-database-and-monetization.md) - Gestión de datos e ingresos pasivos.

---

## 🛠️ Guía de Inicio Rápido

### Requisitos Previos
- Node.js (v18 o superior)
- Una cuenta de Firebase

### Instalación
1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` basado en `.env.example` y añade tus credenciales de Firebase.
4. Enciende los motores:
   ```bash
   npm run dev
   ```

---

## 🚀 Despliegue (Hosting)

El proyecto está configurado para ser desplegado en **Firebase Hosting**:

1. Prepara el paquete optimizado:
   ```bash
   npm run build
   ```
2. Lanza los archivos a la nube:
   ```bash
   firebase deploy --only hosting
   ```

---

## 🔐 Seguridad y Contribución

- **Variables de Entorno**: Las API Keys están protegidas en `.env` (nunca se suben a GitHub).
- **Mantenimiento**: Para añadir juegos, usa la Consola de Firebase. No es necesario modificar el código fuente.

---
*RetroPixel: Infiltrándonos en la nostalgia desde 2024.*
