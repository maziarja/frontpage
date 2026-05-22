import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { FrontpageIcon } from "@/components/icons/frontpage-icon"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/70">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-75"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FrontpageIcon className="h-4 w-4" />
          </span>
          Frontpage
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
    </div>
  )
}
