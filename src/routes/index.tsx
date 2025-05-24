import { createFileRoute } from '@tanstack/react-router'
import logo from '../logo.svg'
import DroneRouteMap from '@/components/DroneRouteMap'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      <DroneRouteMap />
    </div>
  )
}
