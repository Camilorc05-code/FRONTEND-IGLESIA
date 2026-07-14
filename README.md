# Frontend — Iglesia Misión Panamericana Centro de Fe y Esperanza

React + Vite + Tailwind. Sitio público + panel administrativo interno.

## Qué incluye

**Sitio público** (`/`, `/horarios`, `/eventos`, `/eventos/:id`, `/citas`):
- Inicio con próximos servicios y eventos.
- Horarios de servicio agrupados por día.
- Listado de eventos (próximos / realizados) con detalle.
- Formulario público para agendar cita con un pastor (sin necesidad de cuenta).

**Panel interno** (`/admin/login`, `/admin/*`, protegido con JWT):
- Resumen con estadísticas.
- Gestión de personas (base de datos de feligreses): buscar, crear, editar, eliminar.
- Gestión de citas: confirmar, cancelar, marcar completadas.
- Gestión de horarios de servicio.
- Gestión de eventos.

## 1. Configurar y correr localmente

```bash
cd frontend
cp .env.example .env
# Edita .env y pon la URL de tu backend (local o ya desplegado en Render)

npm install
npm run dev   # http://localhost:5173
```

Asegúrate de que el backend esté corriendo y que `FRONTEND_URL` en el `.env` del backend
incluya `http://localhost:5173` (o `*` en desarrollo).

## 2. Desplegar gratis en Vercel

1. Sube este frontend a un repositorio en GitHub (puede ser el mismo repo del backend, en una carpeta `frontend/`, o uno aparte).
2. Entra a https://vercel.com (login con GitHub) → **Add New → Project** → importa el repo.
3. Si el frontend está en una subcarpeta, en "Root Directory" selecciona `frontend`.
4. Framework preset: **Vite** (Vercel lo detecta solo).
5. En **Environment Variables**, agrega:
   - `VITE_API_URL` → la URL de tu backend en Render (ej: `https://iglesia-backend.onrender.com`)
6. Deploy. Vercel te da una URL gratis tipo `https://iglesia-mision.vercel.app`.

## 3. Último paso: conectar CORS

Una vez tengas la URL final de Vercel, actualiza la variable `FRONTEND_URL` en el
backend (Render) con esa URL exacta, para que el navegador no bloquee las peticiones.

## Primer inicio de sesión

Usa el usuario creado por el seed del backend:
- `/admin/login`
- Email: `admin@iglesia.com`
- Password: `CambiaEstaClave123`

Desde ahí, un ADMIN puede crear más usuarios (pastores/líderes) llamando a
`POST /api/auth/usuarios` (aún no hay pantalla para esto en el panel — se puede
agregar como siguiente paso, o hacerlo directo con una herramienta como Postman/Insomnia
mientras tanto).

## Dominio propio (opcional, más adelante)

Cuando quieras usar un dominio propio en vez de `.vercel.app`, en Vercel:
**Project → Settings → Domains** → agrega tu dominio y sigue las instrucciones de DNS
que te da (normalmente un registro CNAME). El certificado SSL se genera automático y gratis.
