# Gemba Arquitectura IB

Plataforma de observación y seguimiento de la aplicación real del nuevo rol de
Arquitectura en Business Line, basada en la **Hipótesis 1**: si se acompaña al
arquitecto en su trabajo diario (Gemba) y se observan sus comportamientos de
forma estructurada, es posible identificar y diagnosticar brechas en las
capacidades necesarias para comprender el negocio, cocrear soluciones y tomar
decisiones orientadas al valor.

El flujo combina dos marcos de Management 3.0:

- **Observación de comportamientos (Gemba)**: un ciclo de preparación →
  observación en el trabajo real → diagnóstico, completado por el
  facilitador/coordinador para cada arquitecto.
- **Moving Motivators**: una autoevaluación que completa el propio arquitecto,
  de forma independiente y sin necesidad de iniciar sesión, a través de un
  wizard público.

No busca puntuar personas — busca identificar qué necesita cambiar en el
arquitecto y qué necesita cambiar en el sistema para que el nuevo rol pueda
ejercerse.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS v4, Vitest + React Testing Library |
| Backend | NestJS 10 + TypeScript, class-validator/class-transformer, Jest |
| Base de datos | Supabase (PostgreSQL + Auth + Row Level Security) |
| E2E / visual | Playwright |
| Contenedores | Docker (backend) |
| Monorepo | npm workspaces (`backend/`, `frontend/`) |

## Estructura del repo

```
.
├── backend/                 NestJS API
│   ├── src/
│   │   ├── auth/             guard + decorators para JWT de Supabase
│   │   ├── records/          CRUD de registros Gemba (DTOs, service, controller)
│   │   ├── dashboard/        métricas, radares y resumen de Moving Motivators
│   │   ├── motivators/       motivadores por registro (legado, pre-wizard público)
│   │   ├── public-motivators/ endpoint público (sin auth) del wizard /motivadores
│   │   ├── import-export/    backup JSON (export/import, siempre agrega)
│   │   ├── settings/         alcance del ciclo (target scope)
│   │   ├── database/         cliente de Supabase (anon / user-scoped / service-role)
│   │   └── common/           constantes compartidas y utilidades
│   └── Dockerfile
├── frontend/                 SPA (React + Vite)
│   └── src/
│       ├── pages/             Home (dashboard), FormView (ficha del arquitecto)
│       ├── pages/public/      wizard público /motivadores
│       ├── components/        formularios, gráficos (radar/barras), dashboard
│       ├── hooks/              useDashboardData, useRecordForm, useAutoSave…
│       ├── lib/                apiClient, export/import, cálculos de radar
│       └── constants/          BEH, MOT, TYPES, macrodominios (duplicado del backend)
├── supabase/
│   └── migrations/            esquema y migraciones incrementales
├── tests/e2e/                 specs de Playwright
├── demo/                      prototipo HTML original (referencia de diseño)
├── docker-compose.yml          backend + Supabase local
└── render.yaml                 blueprint de deploy (backend + frontend)
```

## Características principales

- **Dashboard de equipo** (`Home`): alcance del ciclo con avance gradual por
  fases completadas, radar de observaciones del equipo, radar de impacto y
  prioridad de Moving Motivators, brechas por clasificación, y seguimiento de
  arquitectos.
- **Ficha de arquitecto** (`FormView`), en 3 pestañas:
  - **Resumen**: valor/barreras del piloto, resultado de Moving Motivators
    (o enlace para compartir si está pendiente), y el radar de observaciones
    individual.
  - **Gemba baseline**: observación de comportamientos (Observado / Parcial /
    No observado / N/A) y reconstrucción del flujo real seguido.
  - **Diagnóstico**: debrief con el arquitecto, brechas priorizadas
    (Conocimiento / Competencia) y condiciones del sistema para ejercer el rol.
- **Wizard público `/motivadores`**: sin login, lo completa el propio
  arquitecto (ordenar motivadores por importancia + calificar impacto del
  nuevo rol en cada uno). Rate-limited y con detección de envíos duplicados.
- **Import/export**: respaldo completo o de un solo arquitecto en JSON; la
  carga siempre agrega registros nuevos, nunca reemplaza los existentes.
- **Responsive e imprimible**, con paridad visual respecto al prototipo HTML
  original (`demo/`).

## Ejecución local

### 1. Requisitos

- Node.js ≥ 18
- Docker Desktop corriendo (lo usa el CLI de Supabase para levantar el stack local)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (se invoca vía `npx`, no hace falta instalación global)

### 2. Levantar Supabase local

```bash
npx supabase start
```

Esto levanta Postgres, Auth (GoTrue) y Studio localmente, e imprime la
`API URL` y las keys (`anon`/`service_role`). Para aplicar migraciones nuevas
sin perder datos:

```bash
npx supabase migration up
```

> ⚠️ Nunca usar `supabase db reset` en un entorno con datos reales — borra
> toda la base local.

### 3. Variables de entorno del backend

```bash
cp backend/.env.example backend/.env
```

Completar `backend/.env` con los valores que imprimió `npx supabase start`
(o `npx supabase status` si ya estaba corriendo): `SUPABASE_URL`,
`SUPABASE_KEY` (anon), `SUPABASE_SERVICE_ROLE_KEY`.

### 4. Instalar dependencias y levantar frontend + backend

```bash
npm install          # en la raíz — resuelve ambos workspaces
npm run dev           # backend (NestJS, :3000) + frontend (Vite, :5173) en paralelo
```

También se puede levantar cada uno por separado:

```bash
npm run start:dev -w backend   # http://localhost:3000
npm run dev -w frontend        # http://localhost:5173
```

El wizard público queda disponible en `http://localhost:5173/motivadores`.

### Alternativa: Docker

```bash
docker-compose up
```

Levanta el backend containerizado en `http://localhost:3000`, apuntando al
Supabase local corriendo en el host (`host.docker.internal:54321`). El
frontend sigue corriendo vía Vite (no está containerizado en este
docker-compose).

## Tests

```bash
# Backend (Jest)
cd backend && npm run test

# Frontend (Vitest)
cd frontend && npm run test

# End-to-end (Playwright) — requiere el stack local corriendo (Supabase + backend + frontend)
npx playwright test tests/e2e
```

## Deployment

El blueprint `render.yaml` (raíz del repo) describe dos servicios para
[Render](https://render.com):

- `gemba-backend`: web service a partir de `backend/Dockerfile`, con health
  check en `/health`.
- `gemba-frontend`: static site (build de Vite), con rewrite de SPA para que
  cualquier ruta (incluyendo `/motivadores`) sirva `index.html`.

Variables de entorno a configurar en el dashboard de Render (no versionadas):

| Variable | Servicio | Descripción |
|---|---|---|
| `SUPABASE_URL` | backend | URL del proyecto de Supabase de producción |
| `SUPABASE_KEY` | backend | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | service role key (bypassa RLS — nunca exponer al frontend) |
| `FRONTEND_URL` | backend | origen del frontend desplegado, para el allowlist de CORS |
| `VITE_API_BASE_URL` | frontend | origen del backend desplegado (se compila en el build, a diferencia de dev donde el proxy de Vite lo resuelve) |

El deploy a producción está pendiente de completar (cuenta de Render +
proyecto de Supabase de producción).
