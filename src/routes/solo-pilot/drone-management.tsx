import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/solo-pilot/drone-management')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/solo-pilot/drone-management"!</div>
}
