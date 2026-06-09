import { z, type ZodError } from "zod"

export const employeeSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(80, "Máximo 80 caracteres"),
  email: z.string().email("Email inválido").max(120),
  role: z.enum(["admin", "employee"]),
})

export const shiftSchema = z
  .object({
    title: z.string().trim().min(1, "Título requerido").max(120),
    start: z.coerce.date({ required_error: "Inicio requerido" }),
    end: z.coerce.date({ required_error: "Fin requerido" }),
    employeeId: z.string().trim().min(1, "Selecciona un empleado").max(120),
  })
  .superRefine((data, ctx) => {
    if (!(data.start instanceof Date) || isNaN(+data.start)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["start"], message: "Fecha de inicio inválida" })
    }
    if (!(data.end instanceof Date) || isNaN(+data.end)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["end"], message: "Fecha de fin inválida" })
    }
    if (+data.end <= +data.start) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["end"], message: "La hora de fin debe ser mayor que inicio" })
    }
  })

const strongPwd = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos 1 mayúscula")
  .regex(/[a-z]/, "Debe incluir al menos 1 minúscula")
  .regex(/[0-9]/, "Debe incluir al menos 1 número")

export const authLoginSchema = z.object({
  email: z.string().email("Email inválido").max(120),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
})

export const authRegisterSchema = z
  .object({
    name: z.string().trim().min(1, "Nombre requerido").max(80),
    email: z.string().email("Email inválido").max(120),
    password: strongPwd,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  })

export const emailOnlySchema = z.object({
  email: z.string().email("Email inválido").max(120),
})

// First message per field, keyed by field name — shared by the auth forms.
export function zodErrorMap(error: ZodError): Record<string, string> {
  const map: Record<string, string> = {}
  for (const issue of error.errors) {
    const key = issue.path[0]
    if (key !== undefined && map[String(key)] === undefined) {
      map[String(key)] = issue.message
    }
  }
  return map
}
