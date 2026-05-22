"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { signUpAction } from "@/app/_actions/auth"
import { signUpSchema, type SignUpValues } from "@/schemas/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Field, FieldError } from "@/components/ui/field"

export function SignUpForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  function onSubmit(values: SignUpValues) {
    setServerError(null)
    startTransition(async () => {
      const result = await signUpAction(values.name, values.email, values.password)
      if (result?.error) setServerError(result.error)
    })
  }

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>Enter your details to get started</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field data-invalid={!!errors.name}>
            <Label htmlFor="name">Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  className="h-9"
                  aria-describedby={errors.name ? "name-error" : undefined}
                  aria-invalid={!!errors.name}
                />
              )}
            />
            <FieldError id="name-error">{errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.email}>
            <Label htmlFor="email">Email</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-9"
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                />
              )}
            />
            <FieldError id="email-error">{errors.email?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.password}>
            <Label htmlFor="password">Password</Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="h-9"
                  aria-describedby={errors.password ? "password-error" : undefined}
                  aria-invalid={!!errors.password}
                />
              )}
            />
            <FieldError id="password-error">{errors.password?.message}</FieldError>
          </Field>

          {serverError && (
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full h-10" disabled={isPending}>
            {isPending ? "Creating account…" : "Create account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
