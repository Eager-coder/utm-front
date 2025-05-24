import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Export Route for TanStack Router
export const Route = createFileRoute('/org-dashboard/')({
  component: OrgDashboardHome,
})

// Page Component
function OrgDashboardHome() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Organization Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pilots ⇄ Drones */}
        <Card>
          <CardHeader>
            <CardTitle>Pilots & Drone Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage which pilots are assigned to which drones.
            </p>
            <Button asChild>
              <Link to="/org-dashboard/pilots">Go to assignment panel</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Flight History */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Plan Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Review submitted flight plans and status updates.
            </p>
            <Button asChild>
              <Link to="/org-dashboard/flights">View flight logs</Link>
            </Button>
          </CardContent>
        </Card>
        {/* Flight Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Flight Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View and approve or reject flight submissions.
            </p>
            <Button asChild>
              <Link to="/org-dashboard/flight-requests">Open requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
