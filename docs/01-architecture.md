# 🏗️ Arquitectura Técnica - RetroPixel 2000 (v2.0)

Este documento detalla el paso de una web estática a una **Web App Full-Stack** de alto rendimiento.

## 🚀 Stack Tecnológico Actualizado

| Tecnología | Propósito | Implementación |
| :--- | :--- | :--- |
| **React 18** | UI Library | Componentes funcionales y Hooks para gestión de estado. |
| **Vite** | Build Tool | Bundler de última generación para carga instantánea. |
| **Cloud Firestore** | Base de Datos | NoSQL en tiempo real para el catálogo de juegos. |
| **Three.js + R3F** | Motor 3D | Renderizado del fondo Tron y el minijuego de defensa. |
| **Framer Motion** | Animaciones | Orquestación de la Intro BIOS y transiciones de UI. |
| **Lucide React** | Iconografía | Sistema de iconos vectoriales profesionales. |

## 📁 Estructura del Proyecto (Full-Stack)

```text
/
├── public/              # Favicon y assets estáticos
├── src/
│   ├── components/      # Intro, TronWorld, GameCard, TronShooter
│   ├── firebase/        # Configuración de conexión a Firestore
│   ├── App.jsx          # Orquestador con lógica de filtrado y terminal
│   ├── main.jsx         # Punto de entrada React
│   └── index.css        # Tailwind + Estilos globales CRT
├── firebase.json        # Configuración de despliegue Hosting
└── docs/                # Documentación Técnica
```

## 🔄 Flujo de Datos en Tiempo Real

1. **Sincronización:** La App utiliza `onSnapshot` de Firebase. Cualquier cambio en la consola de Firebase se refleja en la web de los usuarios sin recargar.
2. **Sistema de Notificaciones:** Una terminal virtual en `App.jsx` captura las acciones del usuario (descargas, filtros) y muestra feedback inmediato.
