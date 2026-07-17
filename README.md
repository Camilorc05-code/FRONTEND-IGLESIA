# Frontend — Misión Panamericana

Sitio web de la iglesia. React, Vite y Tailwind. Incluye página pública y panel de administración.

## Páginas públicas

- **Inicio** (`/`): bienvenida, próximo servicio, ministerios, galería, redes sociales.
- **Horarios** (`/horarios`): servicios agrupados por día.
- **Eventos** (`/eventos`): listado con filtro por categoría, galería de fotos.
- **Detalle evento** (`/eventos/:id`): información completa + galería.
- **Citas** (`/citas`): formulario para agendar cita con un pastor.
- **Redes** (`/redes`): reels de Facebook e Instagram.

## Panel administrativo

Ruta `/admin/login`. Protegido con JWT.

- Dashboard con estadísticas
- Personas: crear, editar, eliminar feligreses
- Citas: confirmar, cancelar, completar
- Servicios: gestionar horarios
- Eventos: crear, editar, galería de fotos
- Usuarios: crear, activar/desactivar, eliminar (solo ADMIN)

Los roles PASTOR y LIDER solo acceden a Citas y Personas.

## Correr local

```bash
cp .env.example .env
# Ponér la URL del backend en VITE_API_URL

npm install
npm run dev
```

El backend tiene que estar corriendo. En el `.env` del backend, FRONTEND_URL debe incluir `http://localhost:5173`.

## Desplegar en Vercel

1. Subir a GitHub.
2. En https://vercel.com → Add New → Project → importar el repo.
3. Si está en subcarpeta, configurar Root Directory.
4. Framework: Vite (Vercel lo detecta).
5. Environment Variable: `VITE_API_URL` con la URL del backend en Render.
6. Deploy.

Después de desplegar, actualizar FRONTEND_URL en el backend con la URL de Vercel para que CORS funcione.

## Primer login

- Ruta: `/admin/login`
- Email: `admin@misionpanamericana.com`
- Password: `admin`

Desde ahí se pueden crear más usuarios desde el panel.

## Dominio propio

En Vercel: Project → Settings → Domains → agregar el dominio y configurar el registro CNAME que te dan. El SSL se genera solo.
