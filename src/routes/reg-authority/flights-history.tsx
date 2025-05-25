// src/routes/flights-history.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import {
  LoadScript,
  GoogleMap,
  Polyline,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import { getAllFlights } from '@/api/flight-requests/getAllFlights' // Create this API if needed
import type { FlightRequestDto } from '@/api/flight-requests/createFlightRequest'

export const Route = createFileRoute('/reg-authority/flights-history')({
  component: FlightsHistory,
})

function FlightsHistory() {
  const { data: flights = [], isLoading } = useQuery<FlightRequestDto[]>({
    queryKey: ['allFlights'],
    queryFn: () => getAllFlights(),
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
    <div className="p-6 flex h-screen space-x-6">
      {/* Left Table */}
      <div className="w-1/3 overflow-auto">
        <h2 className="text-xl font-bold mb-4">History of Flights</h2>
        <p className="mb-2 text-sm text-muted-foreground">
          Filter by day | pilot | drone (optional later)
        </p>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-2">
            {flights.map((flight) => (
              <li
                key={flight.id}
                className="p-2 border rounded hover:bg-gray-100 cursor-pointer"
                onMouseEnter={() => setHoveredId(flight.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <p>
                  <strong>Drone:</strong> {flight.drone?.brand}{' '}
                  {flight.drone?.model}
                </p>
                <p>
                  <strong>Pilot:</strong> {flight.user_id}
                </p>
                <p>
                  <strong>Duration:</strong> {flight.planned_departure_time} →{' '}
                  {flight.planned_arrival_time}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map Area */}
      <div className="w-2/3 h-full">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
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
              const color = flightColors[flight.id]
              return (
                <Polyline
                  key={flight.id}
                  path={flight.waypoints.map((wp) => ({
                    lat: wp.latitude,
                    lng: wp.longitude,
                  }))}
                  options={{
                    strokeColor: color,
                    strokeWeight: hoveredId === flight.id ? 6 : 2,
                  }}
                  onMouseOver={() => setHoveredId(flight.id)}
                  onMouseOut={() => setHoveredId(null)}
                />
              )
            })}

            {flights.map((flight) =>
              flight.waypoints.map((wp, idx) => (
                <Marker
                  key={`marker-${flight.id}-${idx}`}
                  position={{ lat: wp.latitude, lng: wp.longitude }}
                  icon={{
                    url: createSvgIcon(flightColors[flight.id], 4),
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
                const firstWp = flight.waypoints[0]
                return firstWp ? (
                  <InfoWindow
                    position={{ lat: firstWp.latitude, lng: firstWp.longitude }}
                    onCloseClick={() => setHoveredId(null)}
                  >
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>ID:</strong> {flight.id}
                      </p>
                      <p>
                        <strong>Drone:</strong> {flight.drone_id}
                      </p>
                      <p>
                        <strong>Duration:</strong>{' '}
                        {flight.planned_departure_time} →{' '}
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
