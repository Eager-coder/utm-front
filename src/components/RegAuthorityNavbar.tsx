import { Link } from '@tanstack/react-router'
import { LogoutButton } from './pilot-registration/LogoutButton'

export function RegAuthorityNavbar() {
  return (
    <nav className="flex justify-between">
      <h1 className="text-3xl font-bold">Regulation Authority</h1>
      <div className="flex gap-4">
        <Link
          to="/reg-authority/organizations"
          className="rounded-md py-1 px-3 border border-zinc-300"
        >
          Organizations
        </Link>
        <Link
          to="/reg-authority"
          className="rounded-md py-1 px-3 border border-zinc-300"
        >
          History of flights
        </Link>
        <Link
          className="rounded-md py-1 px-3 border bg-zinc-900 font-medium text-white  border-zinc-300"
          to="/reg-authority/flight-request-management"
        >
          Flight request management
        </Link>
        <LogoutButton />
      </div>
    </nav>
  )
}
