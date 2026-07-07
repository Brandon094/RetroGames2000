# 💰 Datos, Nube y Estrategia de Retención

Cómo gestionamos el contenido y convertimos una web de juegos en un producto que genera valor.

## ☁️ Cloud Firestore (Backend-as-a-Service)

Hemos migrado del archivo estático `games.json` a una base de datos distribuida:
- **Colección**: `games`
- **Documentos**: Cada juego es un objeto con campos `name`, `year`, `genre`, `mediafireUrl`, `image` e `icon`.
- **Ventaja Pro**: Podemos añadir juegos "en caliente" desde el celular usando la App de Firebase Console.

## 🎮 Estrategia de Retención: El Minijuego
La UX del shooter no es casualidad; sirve para tres propósitos:
1. **Diferenciación**: Ningún competidor ofrece un minijuego 3D propio.
2. **Error Handling**: Se activa cuando no hay resultados de búsqueda, convirtiendo una frustración (no encontrar algo) en diversión.
3. **Métricas**: El sistema de Score incentiva al usuario a pasar más tiempo en la web, mejorando el ranking en buscadores (SEO).

## 💸 Monetización Optimizada
Al ser un proyecto de Abandonware, los ingresos se centran en:
1. **Links Acortados**: Cada `mediafireUrl` en Firestore debe pasar por un acortador.
2. **Branding Retro**: La estética profesional genera confianza, lo que aumenta el porcentaje de clics (CTR) en los enlaces de descarga.
