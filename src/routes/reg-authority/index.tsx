import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reg-authority/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/reg-authority/"!</div>
}
