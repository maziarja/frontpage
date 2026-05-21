import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }),
  password: z.string().trim().min(1, { message: "Password is required" }),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  email: z.string().trim().email({ message: "Enter a valid email address" }),
  password: z.string().trim().min(8, { message: "Password must be at least 8 characters" }),
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
