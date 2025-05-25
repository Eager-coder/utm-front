import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import type { FlightRequestDto } from '@/api/flight-requests/createFlightRequest'
import {
  LoadScript,
  GoogleMap,
  Polyline,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import { getOrgFlightRequests } from '@/api/flight-requests/getOrgFlightRequests'

// Export Route for TanStack Router
export const Route = createFileRoute('/org-dashboard/')({
  component: OrgDashboardHome,
})

function OrgDashboardHome() {
  const { data: flights = [], isLoading } = useQuery<FlightRequestDto[]>({
    queryKey: ['myFlights'],
    queryFn: getOrgFlightRequests,
  })

  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const flightColors = useMemo(() => {
    return flights.reduce<Record<number, string>>((acc, flight) => {
      acc[flight.id] = `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0')}`
      return acc
    }, {})
  }, [flights])

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Organization Dashboard</h1>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <Card>
          <CardHeader>
            <CardTitle>Live Drone Map</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Monitor all drone positions and connection status in real time.
            </p>
            <Button asChild>
              <Link to="/org-dashboard/live-map">View Map</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Flight Logs View */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Flight Requests</h2>
        <div className="flex gap-6">
          {/* Table List */}
          <div className="w-1/3 space-y-2 max-h-[60vh] overflow-auto border rounded p-2">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              flights.map((flight) => (
                <div
                  key={flight.id}
                  className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                  onMouseEnter={() => setHoveredId(flight.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <p>
                    <strong>ID:</strong> {flight.id}
                  </p>
                  <p>
                    <strong>Status:</strong> {flight.status}
                  </p>
                  <p>
                    <strong>Drone:</strong> {flight.drone_id}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Map */}
          <div className="w-2/3">
            <LoadScript
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
            >
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '60vh' }}
                center={
                  flights[0]?.waypoints?.[0]
                    ? {
                        lat: flights[0].waypoints[0].latitude,
                        lng: flights[0].waypoints[0].longitude,
                      }
                    : { lat: 51.13, lng: 71.43 }
                }
                zoom={12}
              >
                {flights.map((flight) => (
                  <Polyline
                    key={flight.id}
                    path={flight.waypoints.map((wp) => ({
                      lat: wp.latitude,
                      lng: wp.longitude,
                    }))}
                    options={{
                      strokeColor: flightColors[flight.id],
                      strokeWeight: hoveredId === flight.id ? 6 : 2,
                    }}
                    onMouseOver={() => setHoveredId(flight.id)}
                    onMouseOut={() => setHoveredId(null)}
                  />
                ))}

                {flights.flatMap((flight) =>
                  flight.waypoints.map((wp, idx) => (
                    <Marker
                      key={`marker-${flight.id}-${idx}`}
                      position={{ lat: wp.latitude, lng: wp.longitude }}
                      icon={{
                        url: createSvgIcon(flightColors[flight.id], 4),
                        //@ts-expect-error
                        anchor: { x: 4, y: 4 },
                      }}
                      onMouseOver={() => setHoveredId(flight.id)}
                      onMouseOut={() => setHoveredId(null)}
                    />
                  )),
                )}

                {hoveredId != null &&
                  (() => {
                    const flight = flights.find((f) => f.id === hoveredId)!
                    const wp = flight.waypoints[0]
                    return wp ? (
                      <InfoWindow
                        position={{ lat: wp.latitude, lng: wp.longitude }}
                        onCloseClick={() => setHoveredId(null)}
                      >
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>ID:</strong> {flight.id}
                          </p>
                          <p>
                            <strong>Status:</strong> {flight.status}
                          </p>
                          <p>
                            <strong>Drone:</strong> {flight.drone_id}
                          </p>
                          <p>
                            <strong>Departure:</strong>{' '}
                            {flight.planned_departure_time}
                          </p>
                          <p>
                            <strong>Arrival:</strong>{' '}
                            {flight.planned_arrival_time}
                          </p>
                        </div>
                      </InfoWindow>
                    ) : null
                  })()}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
      </div>
    </div>
  )

  function createSvgIcon(color: string, radius: number) {
    const size = radius * 2
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}" stroke="white" stroke-width="1" />
</svg>`
    return `data:image/svg+xml;utf-8,${encodeURIComponent(svg)}`
  }
}

// Page Component
// function OrgDashboardHome() {
//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-semibold">Organization Dashboard</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Pilots ⇄ Drones */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Pilots & Drone Assignments</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground mb-4">
//               Manage which pilots are assigned to which drones.
//             </p>
//             <Button asChild>
//               <Link to="/org-dashboard/pilots">Go to assignment panel</Link>
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Flight History */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Flight Plan Logs</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground mb-4">
//               Review submitted flight plans and status updates.
//             </p>
//             <Button asChild>
//               <Link to="/org-dashboard/flights">View flight logs</Link>
//             </Button>
//           </CardContent>
//         </Card>
//         {/* Flight Requests */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Flight Requests</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground mb-4">
//               View and approve or reject flight submissions.
//             </p>
//             <Button asChild>
//               <Link to="/org-dashboard/flight-requests">Open requests</Link>
//             </Button>
//           </CardContent>
//         </Card>
//         {/* Live Map */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Live Drone Map</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground mb-4">
//               Monitor all drone positions and connection status in real time.
//             </p>
//             <Button asChild>
//               <Link to="/org-dashboard/live-map">View Map</Link>
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
