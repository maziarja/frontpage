import { signOut } from "@/app/_actions/auth"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="p-8">
      <p className="mb-4">Dashboard — coming in Phase 4</p>
      <form action={signOut}>
        <Button type="submit" variant="outline">
          Sign Out
        </Button>
      </form>
    </div>
  )
}
