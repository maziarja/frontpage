"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { authClient } from "@/lib/auth-client"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldError } from "@/components/ui/field"

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: ForgotPasswordValues) {
    setServerError(null)
    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password/confirm`,
    })
    if (error) {
      setServerError(error.message ?? "Something went wrong. Please try again.")
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            We sent a password reset link. Check your inbox and follow the instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to sign in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Reset password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                />
              )}
            />
            <FieldError id="email-error">{errors.email?.message}</FieldError>
          </Field>

          {serverError && (
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/sign-in" className="text-foreground underline underline-offset-4 hover:text-primary">
              ← Back to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
