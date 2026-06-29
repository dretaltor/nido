# NIDO — Plataforma Inmobiliaria de Costa Rica

Plataforma inmobiliaria premium construida sobre Next.js 16, Supabase y Claude AI. Conecta asesores verificados con compradores y propietarios en Costa Rica.

**Producción:** [nido-cr.com](https://www.nido-cr.com) | **Deploy:** Vercel (auto-deploy desde `main`)

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Base de datos | Supabase (Postgres + Auth + Storage + RLS) |
| IA | Claude claude-haiku-4-5 (Anthropic) vía API |
| Mapas | Mapbox GL JS con geocoding CR |
| Correos | Resend |
| WhatsApp | Meta Cloud API (WhatsApp Business) |
| Pagos | Stripe (en standby) |

---

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar los valores:

```bash
cp .env.example .env.local
```

Ver `.env.example` para la lista completa con instrucciones de dónde obtener cada valor.

---

## Estructura principal


app/

(public)/           Rutas públicas (portal, ficha, asesores)

admin/              Backoffice de administración

api/                Rutas de API (email, WhatsApp, IA, storage)

dashboard/          Dashboard del asesor (CRM, propiedades, perfil)

dashboard/propietario/  Dashboard del propietario

components/           Componentes reutilizables

lib/

planes.ts           Configuración central de planes (Despega/Elite/Black)

rateLimit.ts        Rate limiting por IP respaldado en Supabase

supabase.ts         Cliente de Supabase

whatsapp.ts         Envío de mensajes WhatsApp
---

## Roles de usuario

| Rol | Acceso |
|---|---|
| **Asesor** | Dashboard, publicar propiedades, CRM, Academia, Valeria IA |
| **Propietario** | Dashboard propietario, ver ofertas/visitas de sus propiedades |
| **Admin** (`dretalva@gmail.com`) | Backoffice completo — aprobar KYC, propiedades, gestionar planes |

---

## Planes

| Plan | Nombre | Precio | Límite propiedades |
|---|---|---|---|
| `gratis` | Despega | $0 (7 días Black gratis) | 5 |
| `pro` | Elite | $59/mes | 15 |
| `enterprise` | Black | $149/mes | Ilimitadas |

Los límites se configuran en `lib/planes.ts` — un solo archivo controla todo.

---

## Desarrollo local

```bash
npm install
cp .env.example .env.local  # completar valores
npm run dev
```

---

## Seguridad

- RLS activo en todas las tablas — cada asesor solo ve sus propios datos
- Uploads de archivos solo vía `/api/upload-firma` (service role, verifica sesión)
- Rate limiting en las 5 rutas de IA/notificaciones
- Headers HTTP de seguridad configurados en `next.config.js`
- Cédula única por cuenta — previene abuso del trial gratuito
