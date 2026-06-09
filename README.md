# ShiftManager — Gestión de Turnos v2.0.0

Aplicación web para gestionar turnos de empleados en un restaurante. Construida con React 18, TypeScript, Vite 8, Firebase 12 y Tailwind CSS.

## Características

- **Autenticación** con Email/Password (Firebase Auth)
- **Roles**: `admin` ve y gestiona todos los empleados y turnos; `employee` solo ve sus propios turnos
- **Calendario interactivo** con `react-big-calendar` y localización en español
- **Panel de estadísticas**: empleados activos, turnos totales y turnos de la semana actual
- **Gestión de empleados**: crear, editar y eliminar empleados (solo admin)
- **Gestión de turnos**: crear, editar y eliminar turnos con asignación de empleado
- **Toasts** de feedback con límite de 5 notificaciones simultáneas
- **Error boundary** con reintentos de renderizado
- **18 tests unitarios** (validación de esquemas y mapeado de errores de Firestore)

## Requisitos

- Node.js 22+
- Cuenta Firebase con Auth + Firestore habilitados
- (Opcional) Docker

## Configuración

### 1. Variables de entorno

Crea un archivo `.env` en la raíz con las credenciales de tu app web de Firebase:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Las variables deben comenzar con `VITE_` para que Vite las exponga al cliente.

### 2. Firebase

1. Habilita **Authentication → Email/Password**.
2. Crea una base de datos **Firestore** en modo producción.
3. Sube `firestore.rules` en la consola: **Firestore → Reglas**.
4. Crea el índice compuesto que requiere la consulta de turnos por empleado:
   - Colección: `shifts`
   - Campos: `employeeId ASC`, `start ASC`

### 3. Instalar dependencias

```bash
npm ci
```

El archivo `.npmrc` del proyecto desactiva la ejecución de scripts de instalación (`ignore-scripts=true`) como medida de seguridad frente a ataques de supply-chain.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite HMR) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualizar el build localmente |
| `npm run type-check` | Verificación de tipos TypeScript sin emitir |
| `npm run test` | Tests en modo watch (Vitest) |
| `npm run test:run` | Tests en modo CI (una sola ejecución) |
| `npm run seed` | Poblar Firestore con datos de prueba |

## Docker

```bash
docker build \
  --build-arg VITE_FIREBASE_API_KEY=xxx \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=xxx \
  --build-arg VITE_FIREBASE_PROJECT_ID=xxx \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=xxx \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=xxx \
  --build-arg VITE_FIREBASE_APP_ID=xxx \
  -t shiftmanager .

docker run -p 8080:80 shiftmanager
```

La imagen de producción usa **nginx:alpine** y sirve el build estático de Vite.

## CI/CD

GitHub Actions ejecuta en cada push a `main` o `claude/**` y en PRs a `main`:

1. `npm ci --ignore-scripts` — instalación sin scripts de ciclo de vida
2. `npm audit --audit-level=high` — falla si hay vulnerabilidades altas o críticas
3. `tsc --noEmit` — comprobación de tipos
4. `vitest run` — tests unitarios
5. `vite build` — build de producción

Las acciones están ancladas a **SHA de commit** en lugar de etiquetas mutables para evitar que una etiqueta comprometida inyecte código.

## Seguridad de supply-chain

- `.npmrc` con `ignore-scripts=true` y `save-exact=true`
- Dependabot configurado con actualizaciones semanales y un periodo de espera de **7 días** antes de adoptar nuevas versiones (la mayoría de paquetes maliciosos se detectan en días)
- Workflow de CI con `permissions: contents: read` (mínimo privilegio)

## Stack

| Capa | Tecnología |
|---|---|
| UI | React 18, Tailwind CSS 3 |
| Lenguaje | TypeScript 6, modo estricto |
| Build | Vite 8 |
| Backend | Firebase 12 (Auth + Firestore) |
| Calendario | react-big-calendar + date-fns |
| Validación | Zod |
| Tests | Vitest + @testing-library/react |
| CI | GitHub Actions |
| Contenedor | Docker (nginx:alpine) |
