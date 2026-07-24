# Misión Panamericana — Centro de Fe y Esperanza

Sistema web integral para la gestión de la iglesia.

**Sitio web:** [misionpanamericana.vercel.app](https://misionpanamericana.vercel.app)

---

## Sitio público

La página principal de la iglesia, disponible para toda la congregación y visitantes:

- **Inicio:** información de la iglesia, próximo servicio, ministerios y galería de fotos.
- **Horarios:** servicios de la semana agrupados por día.
- **Eventos:** próximos eventos de la iglesia con detalles, galería y categorías.
- **Citas:** los feligreses pueden agendar una cita directamente con un pastor.
- **Redes sociales:** enlaces a Facebook e Instagram de la iglesia.
- **Chatbot inteligente:** asistente virtual que responde preguntas sobre servicios, eventos y horarios.
- **Check-in digital:** los asistentes se registran al llegar al servicio (por nombre o código QR).
- **PWA:** se puede instalar como aplicación en celulares y computadoras.

## Panel de administración

Accesible para el equipo pastoral y administrativo de la iglesia:

### Funcionalidades generales
- **Dashboard:** resumen visual con gráficos de asistencia, miembros y estadísticas del mes.
- **Miembros:** registro completo de feligreses con búsqueda, filtros y paginación.
- **Citas:** gestión de citas pastorales con confirmación, cancelación y recordatorios automáticos.
- **Citas online:** los feligreses agendan citas desde la página pública.
- **Nuevos visitantes:** registro de personas que asisten por primera vez.
- **Presentación de bebés:** registro de bebés para presentaciones en la iglesia.
- **Gestión de eventos:** crear, editar y eliminar eventos con galería de fotos.
- **Gestión de servicios:** administrar horarios de cultos de la semana.
- **Usuarios:** crear, activar o desactivar usuarios del sistema.
- **Historial de auditoría:** registro de todas las acciones realizadas en el sistema.
- **Notificaciones:** sistema de notificaciones in-app y por email.

### Contabilidad (solo ADMIN y PASTOR)
- **Registro de diezmos y ofrendas:** asociados al miembro o de forma anónima.
- **Registro de gastos:** descripción detallada de cada gasto.
- **Registro de donaciones:** donaciones externas o anónimas.
- **Resumen mensual:** visualización de entradas, gastos y balance por mes.
- **Selector de mes y año:** navegar entre diferentes períodos.
- **Exportar Excel:** descargar reportes por tipo (diezmos, ofrendas, gastos, donaciones) o todos juntos.
- **Editar registros:** corregir información de movimientos ya registrados.
- **Método de pago:** efectivo, transferencia, Nequi, Daviplata u otro.

### Alertas (solo ADMIN y PASTOR)
- **Inasistencia:** detecta miembros que faltaron a más de 3 domingos consecutivos.
- **Cumpleaños:** lista de cumpleaños del mes con opción de notificar.

## Seguridad

- Inicio de sesión con código OTP enviado por email (verificación obligatoria).
- Cada usuario puede cambiar su contraseña desde el panel.
- Roles diferenciados: ADMIN (acceso total), PASTOR (contabilidad, alertas, asistencia), LIDER (citas, personas, bebés).
- Registro de auditoría: cada acción queda registrada con usuario, fecha y detalle.
- Base de datos cifrada en reposo (Supabase/PostgreSQL).
- Conexiones seguras con HTTPS.

## Acceso al panel

La ruta de acceso al panel de administración es:

```
misionpanamericana.vercel.app/admin/login
```

Los usuarios y contraseñas son gestionados exclusivamente por el administrador del sistema.

## Soporte

Para solicitudes de soporte, cambios o mejoras, contactar al equipo de desarrollo.
