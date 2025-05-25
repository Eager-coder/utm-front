import { RegAuthorityNavbar } from '@/components/RegAuthorityNavbar'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reg-authority/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-7xl mx-auto">
      <RegAuthorityNavbar />
    </div>
  )
}
