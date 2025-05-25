import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { getMyFlighRequests } from '@/api/flight-requests/getMyFlightRequests'
import { getMyDrones } from '@/api/drone-management/getMyDrones'
import {
  GoogleMap,
  LoadScript,
  Polyline,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import type { FlightRequestDto } from '@/api/flight-requests/createFlightRequest'
import type { Drone } from '@/api/drone-management/createDrone'
import { OrgPilotNavbar } from '@/components/OrgPilotNavbar'
// import { OrgPilotNavbar } from '@/components/OrgPilotNavbar'

export const Route = createFileRoute('/org-pilot/')({
  component: OrgPilotFlightRequests,
})

function OrgPilotFlightRequests() {
  const { data: flights = [], isLoading } = useQuery<FlightRequestDto[]>({
    queryKey: ['myFlights'],
    queryFn: getMyFlighRequests,
  })

  const { data: assignedDrones = [] } = useQuery<Drone[]>({
    queryKey: ['assignedDrone'],
    queryFn: () => getMyDrones(),
  })

  const assignedDrone = assignedDrones ? assignedDrones[0] : undefined

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
    <div className="max-w-7xl mx-auto">
      {/* <OrgPilotNavbar /> */}
      <OrgPilotNavbar />

      <div className="p-6 flex h-full space-x-6 mt-10">
        {/* Left Panel */}
        <div className="w-1/3 space-y-6 overflow-auto">
          <div>
            <h2 className="text-xl font-semibold mb-2">My Assigned Drone</h2>
            <div className="border rounded-md p-3 bg-muted text-sm space-y-1">
              {assignedDrone ? (
                <>
                  <p>
                    <strong>Brand:</strong> {assignedDrone.brand}
                  </p>
                  <p>
                    <strong>Model:</strong> {assignedDrone.model}
                  </p>
                  <p>
                    <strong>Serial Number:</strong>{' '}
                    {assignedDrone.serial_number}
                  </p>
                </>
              ) : (
                <p>No assigned drone found.</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-2">My Flight Requests</h2>
            <Link
              to="/org-pilot/new-flight-request"
              className="text-sm px-3 py-1 bg-zinc-900 text-white rounded hover:bg-zinc-800"
            >
              + New
            </Link>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-2">
              {flights.map((flight) => (
                <li
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
                    <strong>Departure:</strong> {flight.planned_departure_time}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Map */}
        <div className="w-2/3 h-full">
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
          >
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '500px' }}
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
