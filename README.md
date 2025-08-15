# Employee Shift Scheduler (React + Firebase + Tailwind)

**Objetivo:** gestionar turnos de empleados con autenticación, roles, calendario y buenas prácticas de seguridad.

## Requisitos
- Node 18+
- Cuenta Firebase (Auth + Firestore)
- (Opcional) Docker

## Configuración
1. `cp .env.example .env` y pega las credenciales de tu app web en Firebase.
2. En Firebase:
   - Habilita **Authentication (Email/Password)**.
   - Crea **Firestore** (modo producción).
   - Sube **firestore.rules** en la consola de Firestore > Reglas.
3. Instala deps:
   ```bash
   npm install
   npm run dev