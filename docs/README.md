# 📖 La Biblia del Desarrollador v2.0 - RetroPixel

Esta es la documentación técnica del proyecto RetroPixel, un archivo digital de preservación de juegos clásicos (1997-2007) construido como una Web App moderna de alta gama.

## 📜 Capítulos

1. [🏗️ Arquitectura Full-Stack](./01-architecture.md) - React + Vite + Firestore.
2. [🎨 Experiencia 3D y Sonido](./02-animations-3d.md) - Tron Shooter y Audio Sintetizado.
3. [💰 Cloud y Estrategia](./03-database-and-monetization.md) - Gestión de datos e ingresos pasivos.

## 🚀 Despliegue (Hosting)

Para subir cambios a producción:
1. `npm run build` (Prepara el paquete optimizado en `/dist`).
2. `firebase deploy --only hosting` (Lanza los archivos a la nube de Google).

## 🛠️ Mantenimiento de Datos
No edites código para añadir juegos. Usa la consola de Firebase -> Cloud Firestore -> Colección `games`.

---
*RetroPixel: Infiltrándonos en la nostalgia desde 2024.*
