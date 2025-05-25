import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
// import logo from '../logo.svg'
// import DroneRouteMap from '@/components/DroneRouteMap'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { user, isLoading } = useUser()
  const navigate = useNavigate()
  // Redirect logic
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      navigate({ to: '/login' })
      return
    }
    switch (user.role) {
      case 'SOLO_PILOT':
        navigate({ to: '/solo-pilot' })
        break
      case 'ORGANIZATION_PILOT':
        navigate({ to: '/org-pilot' })
        break
      case 'ORGANIZATION_ADMIN':
        navigate({ to: '/org-dashboard' })
        break
      case 'AUTHORITY_ADMIN':
        navigate({ to: '/reg-authority/organizations' })
        break
      default:
        navigate({ to: '/login' })
    }
  }, [user, isLoading, navigate])
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading user info...
      </div>
    )
  }
  const commonLinkStyle =
    'text-blue-600 hover:text-blue-800 visited:text-purple-600'
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Welcome to the UTM Front App!
      </h1>
      <p className="text-lg mb-8 text-center">
        This is the main entry point of the application. Navigate to different
        sections using the links below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Core</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/" className={commonLinkStyle}>
                Home (Current)
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Login</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/login" className={commonLinkStyle}>
                Login
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Organization Dashboard</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/org-dashboard" className={commonLinkStyle}>
                Dashboard Home
              </Link>
            </li>
            <li>
              <Link
                to="/org-dashboard/flight-requests"
                className={commonLinkStyle}
              >
                Flight Requests
              </Link>
            </li>
            <li>
              <Link to="/org-dashboard/flights" className={commonLinkStyle}>
                Flights
              </Link>
            </li>
            <li>
              <Link to="/org-dashboard/live-map" className={commonLinkStyle}>
                Live Map
              </Link>
            </li>
            <li>
              <Link to="/org-dashboard/pilots" className={commonLinkStyle}>
                Pilots
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Organization Pilot</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/org-pilot" className={commonLinkStyle}>
                Org Pilot Home
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Registration</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/org-registration" className={commonLinkStyle}>
                Organization Registration
              </Link>
            </li>
            <li>
              <Link to="/org-registration/success" className={commonLinkStyle}>
                Org Registration Success
              </Link>
            </li>
            <li>
              <Link to="/pilot-registration" className={commonLinkStyle}>
                Pilot Registration
              </Link>
            </li>
            <li>
              <Link
                to="/pilot-registration/success"
                className={commonLinkStyle}
              >
                Pilot Registration Success
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Regulatory Authority</h2>
          <ul className="space-y-2">
            <li>
              <Link
                to="/reg-authority/organizations"
                className={commonLinkStyle}
              >
                RA Organizations
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {/* Uncomment if DroneRouteMap is to be used here */}
      {/* <div className="mt-10"> */}
      {/*   <DroneRouteMap /> */}
      {/* </div> */}
    </div>
  )
}
