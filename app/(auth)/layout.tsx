import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted p-4 gap-6">
      <Link
        href="/"
        className="text-xl font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
      >
        Frontpage
      </Link>
      <main className="w-full flex justify-center">{children}</main>
    </div>
  )
}
