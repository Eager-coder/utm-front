import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/solo-pilot/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/solo-pilot/"!</div>
}
