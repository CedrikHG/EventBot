# 🎸 EventBot Panel - Radar de Cultura y Música

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Spotify](https://img.shields.io/badge/Spotify-1ED760?style=for-the-badge&logo=spotify&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)

Una aplicación web orientada a servicios que centraliza tus preferencias musicales y ubicación geográfica para automatizar notificaciones sobre tus artistas favoritos. Diseñada con una interfaz moderna en Dark Mode.

## 📌 1. Descripción del Problema e Introducción
Actualmente, los usuarios invierten mucho tiempo revisando manualmente múltiples aplicaciones de boletos, redes sociales y plataformas de streaming para mantenerse al tanto de lanzamientos musicales o eventos en su zona. 

**Objetivo:** Desarrollar un panel de control centralizado ("EventBot Panel") que vincule las preferencias de escucha del usuario con su ubicación (ej. Santiago de Querétaro) para generar y enviar alertas automatizadas a través de mensajería instantánea.

## 🔌 2. APIs Externas Integradas
Este proyecto implementa una arquitectura basada en microservicios consumiendo 4 APIs clave:

1. **Plataforma Online / Streaming (Spotify API):** Implementación de autenticación segura OAuth 2.0 con flujo PKCE para proteger las credenciales del usuario en el frontend y extracción del endpoint `/me/top/artists`.
2. **Geolocalización (Mapbox API):** Renderizado de mapas interactivos estilizados (`dark-v11`) para que el usuario pueda visualizar su zona de cobertura y monitoreo de eventos.
3. **Base de Datos (Supabase):** Integración de BaaS (Backend as a Service) para la persistencia del perfil de usuario, guardando preferencias en formato JSONB y manteniendo el estado de sincronización en tiempo real.
4. **Redes Sociales / Mensajería (Telegram API):** Conexión con un bot personalizado (`@Buebitoconchorizo_bot`) mediante peticiones POST para el envío automatizado de notificaciones formateadas en HTML.

## 🏗️ 3. Arquitectura y Flujo de Datos
El sistema sigue un flujo de información unidireccional y persistente:
1. **Autenticación:** El usuario ingresa a la aplicación web (React) y autoriza el acceso a su cuenta mediante el flujo PKCE de Spotify.
2. **Extracción y Persistencia:** La app obtiene el token de acceso (almacenado en cookies locales), consume los *Top Artists* y realiza un `INSERT` en la tabla `user_config` de Supabase.
3. **Visualización:** El mapa interactivo de Mapbox ubica al usuario geográficamente.
4. **Notificación:** El usuario ingresa su `chat_id` de Telegram. El sistema cruza la información musical con la ubicación y emite una alerta estructurada directamente al dispositivo del usuario.

## 🛠️ 4. Pruebas y Resultados
Durante el desarrollo se validaron los siguientes puntos:
* **Manejo de Errores OAuth:** Resolución de colisiones del *React Strict Mode* y caducidad de códigos de un solo uso implementando ref-blocking.
* **Persistencia de Sesión:** Implementación de cookies con caducidad de 1 hora (alineado al TTL del token de Spotify) e integración de banner de consentimiento.
* **Validación de Datos:** Formateo correcto del *payload* hacia Telegram, asegurando que los arrays de JSON sean legibles en el mensaje final.

## 🚀 5. Instalación y Despliegue Local

### Requisitos Previos
* Node.js (v16+)
* Cuentas de desarrollador en Spotify, Mapbox, Supabase y Telegram.

### Pasos
1. Clona este repositorio:
   ```bash
   git clone [https://github.com/tu-usuario/eventbot-panel.git](https://github.com/tu-usuario/eventbot-panel.git)