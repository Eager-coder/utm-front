import { LogoutButton } from './pilot-registration/LogoutButton'

export function OrgPilotNavbar() {
  return (
    <nav className="flex justify-between">
      <h1 className="text-3xl font-semibold">Organization Pilot Dashboard</h1>

      <LogoutButton />
    </nav>
  )
}
