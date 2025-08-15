// Script simple de "seed" usando SDK cliente (requiere tener habilitado el dominio donde lo ejecutes en Firebase).
// Ejecuta: node seed.js   (necesita variables de entorno *no VITE_* para este script).
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, setDoc, doc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function main () {
  // Crea dos empleados de ejemplo (usa UIDs ficticios para la demo)
  const adminUID = 'demo-admin-uid'
  const empUID = 'demo-employee-uid'

  await setDoc(doc(db, 'employees', adminUID), {
    name: 'Admin Demo',
    email: 'admin@empresa.com',
    role: 'admin'
  })

  await setDoc(doc(db, 'employees', empUID), {
    name: 'Juan Pérez',
    email: 'empleado@empresa.com',
    role: 'employee'
  })

  const start = new Date()
  const end = new Date(start.getTime() + 8 * 60 * 60 * 1000)

  await setDoc(doc(db, 'shifts', 'shift-demo-1'), {
    title: 'Turno Mañana — Juan',
    start,
    end,
    employeeId: empUID,
    createdBy: adminUID,
    createdAt: serverTimestamp()
  })

  console.log('Seed completado ✔️')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
