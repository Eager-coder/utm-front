// src/routes/org-dashboard/flight-requests.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMyFlighRequests } from '@/api/flight-requests/getMyFlightRequests'

import {
  GoogleMap,
  LoadScript,
  Polyline,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
// import { Button } from '@/components/ui/button'
import type { FlightRequestDto } from '@/api/flight-requests/createFlightRequest'
import { LogoutButton } from '@/components/pilot-registration/LogoutButton'
import { SoloPilotNavbar } from '@/components/SoloPilotNavbar'

export const Route = createFileRoute('/solo-pilot/')({
  component: FlightRequests,
})

function FlightRequests() {
  //   const navigate = useNavigate()
  const { data: flights = [], isLoading: loadingFlights } = useQuery<
    FlightRequestDto[]
  >({
    queryKey: ['myFlights'],
    queryFn: getMyFlighRequests,
  })
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  // Generate one random color per flight, memoized so it won't change on hover
  const flightColors = useMemo(() => {
    return flights.reduce<Record<number, string>>((acc, flight) => {
      acc[flight.id] = `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0')}`
      return acc
    }, {})
  }, [flights])

  return (
    <div className="max-w-5xl mx-auto">
      {/* Sidebar */}
      <SoloPilotNavbar />

      <div className="p-6 flex h-screen mt-10">
        <div className="w-1/3 pr-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Flight Requests</h2>
          </div>
          {loadingFlights ? (
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
                  <p>ID: {flight.id}</p>
                  <p>Status: {flight.status}</p>
                  <p>Drone: {flight.drone_id}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Map with routes & markers */}
        <div className="w-2/3 h-full">
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
          >
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
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
              {flights.map((flight) => {
                const path = flight.waypoints as any[]
                const color = flightColors[flight.id]
                return (
                  <Polyline
                    key={flight.id}
                    path={path.map((wp) => ({
                      lat: wp.latitude,
                      lng: wp.longitude,
                    }))}
                    options={{
                      strokeColor: color,
                      strokeWeight: flight.id === hoveredId ? 6 : 2,
                    }}
                    onMouseOver={() => setHoveredId(flight.id)}
                    onMouseOut={() => setHoveredId(null)}
                  />
                )
              })}

              {flights.map((flight) =>
                (flight.waypoints as any[]).map((wp, idx) => (
                  <Marker
                    key={`marker-${flight.id}-${idx}`}
                    position={{ lat: wp.latitude, lng: wp.longitude }}
                    icon={{
                      url: createSvgIcon(flightColors[flight.id], 4),
                      // @ts-expect-error eqgegewg
                      anchor: { x: 4, y: 4 },
                    }}
                    onMouseOver={() => setHoveredId(flight.id)}
                    onMouseOut={() => setHoveredId(null)}
                  />
                )),
              )}

              {/* Single InfoWindow at the first waypoint of the hovered flight */}
              {hoveredId != null &&
                (() => {
                  const flight = flights.find((f) => f.id === hoveredId)!
                  const firstWp = flight.waypoints[0]
                  return firstWp ? (
                    <InfoWindow
                      position={{
                        lat: firstWp.latitude,
                        lng: firstWp.longitude,
                      }}
                      onCloseClick={() => setHoveredId(null)}
                    >
                      <div className="space-y-1">
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
                        {flight.notes && (
                          <p>
                            <strong>Notes:</strong> {flight.notes}
                          </p>
                        )}
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

  // helper kept at bottom so TSX stays clean
  function createSvgIcon(color: string, radius: number) {
    const size = radius * 2
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}" stroke="white" stroke-width="1" />
</svg>`
    return `data:image/svg+xml;utf-8,${encodeURIComponent(svg)}`
  }
}
