import { Link } from '@tanstack/react-router'
import { LogoutButton } from './pilot-registration/LogoutButton'

export function SoloPilotNavbar() {
  return (
    <nav className="flex justify-between">
      <h1 className="text-3xl font-bold">Solo pilot</h1>
      <div className="flex gap-4">
        <Link
          to="/solo-pilot"
          className="rounded-md py-1 px-3 border border-zinc-300"
        >
          Dashboard
        </Link>
        <Link
          to="/solo-pilot/drone-management"
          className="rounded-md py-1 px-3 border border-zinc-300"
        >
          Drone management
        </Link>
        <Link
          className="rounded-md py-1 px-3 border bg-zinc-900 font-medium text-white  border-zinc-300"
          to="/solo-pilot/new-flight-request"
        >
          New flight request
        </Link>
        <LogoutButton />
      </div>
    </nav>
  )
}
