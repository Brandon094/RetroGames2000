# 🎨 Animaciones, 3D y Audio Sintetizado

RetroPixel v2.0 es una experiencia sensorial completa. Aquí se explica la lógica detrás de los efectos más avanzados.

## 💾 Intro Estilo BIOS/Terminal
El componente `Intro.jsx` utiliza Framer Motion para:
- Simular un arranque de sistema hacker línea por línea.
- Aplicar un filtro visual **CRT (Cathode Ray Tube)** mediante gradientes repetitivos en CSS para dar el look de monitor antiguo.
- Transición de salida con `blur` y `scale` para revelar la App.

## 🚀 Protocolo de Defensa (Tron Shooter)
Un minijuego 3D procedural integrado en `TronShooter.jsx`:
- **Gameplay**: Lógica de disparos con detección de colisiones basada en distancia euclidiana en el espacio 3D.
- **Dificultad Dinámica**: Uso de un `speedMultiplier` que escala con el score del usuario.
- **Mobile First**: Implementación de eventos `touchstart` para permitir el movimiento y disparo en dispositivos táctiles.

## 🔊 Audio Engine (Web Audio API)
No se utilizan archivos .mp3 para optimizar la carga. El sistema genera ondas de sonido puras en tiempo real:
- **Disparo**: Onda cuadrada con rampa de frecuencia descendente.
- **Impacto**: Onda de sierra corta.
- **Explosión**: Ruido blanco filtrado (simulado con osciladores de baja frecuencia).
