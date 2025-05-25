// src/routes/solo-pilot/index.tsx (or appropriate file for /solo-pilot/ route)
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import {
  GoogleMap,
  LoadScript,
  Polyline,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import type {
  FlightRequestDto,
  WaypointDto,
} from '@/api/flight-requests/createFlightRequest' // Ensure Waypoint is exported or defined
import { SoloPilotNavbar } from '@/components/SoloPilotNavbar'
import { getMyFlighRequests } from '@/api/flight-requests/getMyFlightRequests'
import { Button } from '@/components/ui/button'
// import { activateDrone } from '@/api/flight-requests/activateDrone' // We'll simulate this
import { queryClient } from '@/main'

export const Route = createFileRoute('/solo-pilot/')({
  component: SoloPilotDashboard,
})

interface LiveDronePosition {
  lat: number
  lng: number
  altitude?: number
  timestamp?: string
  waypointIndex: number // Current waypoint target index
  progressToNextWaypoint: number // 0.0 to 1.0
}

// Define a type for simulated flight state
interface SimulatedFlight {
  flightId: number
  waypoints: WaypointDto[]
  currentPosition: LiveDronePosition
  intervalId?: number // To store interval ID for clearing
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' // Frontend simulation status
}

// Constants for simulation
const SIMULATION_TICK_MS = 100 // Update position every 100ms
const SIMULATION_SPEED_MPS = 20 // Simulated drone speed in meters per second

function SoloPilotDashboard() {
  const { data: flights = [], isLoading: loadingFlights } = useQuery<
    FlightRequestDto[]
  >({
    queryKey: ['myFlights'],
    queryFn: getMyFlighRequests,
  })

  const [hoveredFlightId, setHoveredFlightId] = useState<number | null>(null)
  // const [liveDronePositions, setLiveDronePositions] = useState<Record<number, LiveDronePosition>>({})
  // const webSocketRef = useRef<WebSocket | null>(null)

  // Store for simulated flights
  const [simulatedFlights, setSimulatedFlights] = useState<
    Record<number, SimulatedFlight>
  >({})
  // @ts-expect-error
  const simulationIntervalsRef = useRef<Record<number, NodeJS.Timeout>>({})

  // Memoized planned route colors
  const flightPlannedRouteColors = useMemo(() => {
    return flights.reduce<Record<number, string>>((acc, flight) => {
      acc[flight.id] = `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0')}`
      return acc
    }, {})
  }, [flights])

  // --- FRONTEND SIMULATION LOGIC ---

  const haversineDistance = (
    coords1: { lat: number; lng: number },
    coords2: { lat: number; lng: number },
  ): number => {
    const R = 6371e3 // metres
    const φ1 = (coords1.lat * Math.PI) / 180 // φ, λ in radians
    const φ2 = (coords2.lat * Math.PI) / 180
    const Δφ = ((coords2.lat - coords1.lat) * Math.PI) / 180
    const Δλ = ((coords2.lng - coords1.lng) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // in metres
  }

  const interpolatePosition = (
    start: WaypointDto,
    end: WaypointDto,
    progress: number,
  ): { lat: number; lng: number; alt: number } => {
    const lat = start.latitude + (end.latitude - start.latitude) * progress
    const lng = start.longitude + (end.longitude - start.longitude) * progress
    const alt =
      start.altitude_m + (end.altitude_m - start.altitude_m) * progress
    return { lat, lng, alt }
  }

  const startFrontendSimulation = (flightId: number) => {
    const flightToSimulate = flights.find((f) => f.id === flightId)
    if (
      !flightToSimulate ||
      !flightToSimulate.waypoints ||
      flightToSimulate.waypoints.length < 2
    ) {
      console.warn(
        'Cannot simulate flight: not found or insufficient waypoints.',
        flightId,
      )
      return
    }

    // Clear existing interval if any
    if (simulationIntervalsRef.current[flightId]) {
      clearInterval(simulationIntervalsRef.current[flightId])
    }

    setSimulatedFlights((prev) => ({
      ...prev,
      [flightId]: {
        flightId: flightId,
        waypoints: flightToSimulate.waypoints as WaypointDto[],
        currentPosition: {
          lat: (flightToSimulate.waypoints as WaypointDto[])[0].latitude,
          lng: (flightToSimulate.waypoints as WaypointDto[])[0].longitude,
          altitude: (flightToSimulate.waypoints as WaypointDto[])[0].altitude_m,
          timestamp: new Date().toISOString(),
          waypointIndex: 0, // Start by targeting the second waypoint (index 1)
          progressToNextWaypoint: 0,
        },
        status: 'ACTIVE',
      },
    }))

    const intervalId = setInterval(() => {
      setSimulatedFlights((prevSims) => {
        const currentSim = prevSims[flightId]
        if (
          !currentSim ||
          currentSim.status !== 'ACTIVE' ||
          currentSim.waypoints.length < 2
        ) {
          clearInterval(intervalId)
          return prevSims
        }

        let { waypointIndex, progressToNextWaypoint } =
          currentSim.currentPosition
        const waypoints = currentSim.waypoints

        if (waypointIndex >= waypoints.length - 1) {
          // Already at or past the last waypoint
          clearInterval(intervalId)
          delete simulationIntervalsRef.current[flightId]
          return {
            ...prevSims,
            [flightId]: { ...currentSim, status: 'COMPLETED' },
          }
        }

        const startWp = waypoints[waypointIndex]
        const endWp = waypoints[waypointIndex + 1]

        const segmentDistance = haversineDistance(
          { lat: startWp.latitude, lng: startWp.longitude },
          { lat: endWp.latitude, lng: endWp.longitude },
        )

        const distancePerTick =
          (SIMULATION_SPEED_MPS * SIMULATION_TICK_MS) / 1000 // distance covered in one tick

        let newProgress = progressToNextWaypoint
        if (segmentDistance > 0) {
          // Avoid division by zero for coincident waypoints
          newProgress += distancePerTick / segmentDistance
        } else {
          newProgress = 1.0 // Instantly complete zero-distance segment
        }

        if (newProgress >= 1.0) {
          waypointIndex++
          newProgress = 0 // Reset progress for the new segment
          if (waypointIndex >= waypoints.length - 1) {
            // Reached the end of the flight path
            clearInterval(intervalId)
            delete simulationIntervalsRef.current[flightId]
            // Final position at the last waypoint
            const finalPosition = {
              lat: endWp.latitude,
              lng: endWp.longitude,
              altitude: endWp.altitude_m,
              timestamp: new Date().toISOString(),
              waypointIndex: waypointIndex,
              progressToNextWaypoint: 1.0,
            }
            return {
              ...prevSims,
              [flightId]: {
                ...currentSim,
                currentPosition: finalPosition,
                status: 'COMPLETED',
              },
            }
          }
        }

        const currentTargetWp =
          waypoints[waypointIndex + 1] || waypoints[waypoints.length - 1] // Next or last
        const interpolated = interpolatePosition(
          startWp,
          currentTargetWp,
          newProgress,
        )

        return {
          ...prevSims,
          [flightId]: {
            ...currentSim,
            currentPosition: {
              ...interpolated,
              altitude: interpolated.alt,
              timestamp: new Date().toISOString(),
              waypointIndex: waypointIndex,
              progressToNextWaypoint: newProgress,
            },
          },
        }
      })
    }, SIMULATION_TICK_MS)

    simulationIntervalsRef.current[flightId] = intervalId
  }

  // Backend mutation (keep for eventual backend integration, but we'll call startFrontendSimulation)
  const { mutate: activateFlightMutation } = useMutation({
    mutationFn: async (id: number) => {
      // This would be your API call: await activateDrone(id)
      // For now, we just simulate success and update UI state
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
      return { id } // Return something to satisfy onSuccess
    },
    onSuccess: (data, flightId) => {
      queryClient.invalidateQueries({ queryKey: ['myFlights'] }) // To update flight status in list
      startFrontendSimulation(flightId)
      // Also update the local 'flights' state for status, or rely on query invalidation
      // This part is tricky as queryClient.invalidateQueries is async
      // For immediate UI update for simulation start:
      const flight = flights.find((f) => f.id === flightId)
      if (flight) {
        // This is a bit of a hack to make the UI reflect "ACTIVE" status from a frontend perspective
        // Ideally, the backend would confirm activation, then the WebSocket would provide telemetry
        // For pure frontend simulation, we can update the status locally.
        // Note: This local status update might be overwritten when `getMyFlighRequests` refetches
        // if the backend `activateDrone` doesn't actually change the status immediately or if there's a delay.
        // For now, let's assume `queryClient.invalidateQueries` will eventually update the status from backend.
      }
    },
    onError: (error, flightId) => {
      console.error(`Failed to activate flight ${flightId}:`, error)
      // Optionally stop simulation if it somehow started
    },
  })

  useEffect(() => {
    // Cleanup intervals on component unmount
    return () => {
      Object.values(simulationIntervalsRef.current).forEach(clearInterval)
    }
  }, [])

  // Removed WebSocket useEffect hook for now as we are simulating on frontend

  const mapCenter = useMemo(() => {
    if (
      flights.length > 0 &&
      flights[0].waypoints &&
      flights[0].waypoints.length > 0
    ) {
      return {
        lat: flights[0].waypoints[0].latitude,
        lng: flights[0].waypoints[0].longitude,
      }
    }
    return { lat: 51.13, lng: 71.43 } // Default center (e.g., Astana)
  }, [flights])

  return (
    <div className="max-w-7xl mx-auto">
      <SoloPilotNavbar />
      <div className="p-4 md:p-6 flex flex-col md:flex-row h-[calc(100vh-4rem)] mt-16">
        <div className="w-full md:w-1/3 md:pr-4 overflow-y-auto mb-4 md:mb-0 md:h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Flight Requests</h2>
            {/* Example: <Button asChild><Link to="/solo-pilot/flight-request/new">New Request</Link></Button> */}
          </div>
          {loadingFlights ? (
            <p>Loading flight requests...</p>
          ) : flights.length === 0 ? (
            <p>No flight requests found.</p>
          ) : (
            <ul className="space-y-2">
              {flights.map((flight) => (
                <li
                  key={flight.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onMouseEnter={() => setHoveredFlightId(flight.id)}
                  onMouseLeave={() => setHoveredFlightId(null)}
                  style={{ borderColor: flightPlannedRouteColors[flight.id] }}
                >
                  <div className="font-medium flex justify-between">
                    <span>Flight ID: {flight.id}</span>
                    {/* Button to activate flight and start frontend simulation */}
                    {flight.status === 'APPROVED' &&
                      !simulatedFlights[flight.id]?.intervalId && (
                        <Button
                          onClick={() => activateFlightMutation(flight.id)}
                        >
                          Activate & Simulate
                        </Button>
                      )}
                    {simulatedFlights[flight.id]?.status === 'ACTIVE' && (
                      <span className="text-sm text-blue-500 font-semibold">
                        Simulating...
                      </span>
                    )}
                    {simulatedFlights[flight.id]?.status === 'COMPLETED' && (
                      <span className="text-sm text-green-500 font-semibold">
                        Simulation Done
                      </span>
                    )}
                  </div>
                  <p>
                    Status:{' '}
                    <span
                      className={`font-semibold ${
                        flight.status === 'ACTIVE' ||
                        flight.status === 'APPROVED' ||
                        simulatedFlights[flight.id]?.status === 'ACTIVE'
                          ? 'text-green-500'
                          : flight.status.startsWith('REJECTED') ||
                              flight.status.startsWith('CANCELLED')
                            ? 'text-red-500'
                            : 'text-yellow-500'
                      }`}
                    >
                      {simulatedFlights[flight.id]?.status === 'ACTIVE'
                        ? 'ACTIVE (Simulated)'
                        : flight.status}
                    </span>
                  </p>
                  <p>Drone ID: {flight.drone_id}</p>
                  <p className="text-sm text-gray-500">
                    Departure:{' '}
                    {new Date(flight.planned_departure_time).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-full md:w-2/3 h-1/2 md:h-full">
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
          >
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={14}
            >
              {flights.map((flight) => {
                const path = flight.waypoints as WaypointDto[]
                if (!path || path.length === 0) return null
                const color = flightPlannedRouteColors[flight.id]
                return (
                  <Polyline
                    key={`planned-${flight.id}`}
                    path={path.map((wp) => ({
                      lat: wp.latitude,
                      lng: wp.longitude,
                    }))}
                    options={{
                      strokeColor: color,
                      strokeOpacity: 0.7,
                      strokeWeight: flight.id === hoveredFlightId ? 5 : 3,
                      zIndex: 1,
                    }}
                    onMouseOver={() => setHoveredFlightId(flight.id)}
                    onMouseOut={() => setHoveredFlightId(null)}
                  />
                )
              })}

              {/* Simulated Drone Markers */}
              {Object.values(simulatedFlights)
                .filter((sim) => sim.status === 'ACTIVE')
                .map((simulatedFlight) => (
                  <Marker
                    key={`sim-drone-${simulatedFlight.flightId}`}
                    position={{
                      lat: simulatedFlight.currentPosition.lat,
                      lng: simulatedFlight.currentPosition.lng,
                    }}
                    icon={{
                      // path: 'M22 10 C22 12.2091 20.2091 14 18 14 C15.7909 14 14 12.2091 14 10 C14 7.79086 15.7909 6 18 6 C20.2091 6 22 7.79086 22 10 Z M12 10 L6 10 M18 20 L18 14', // Simple drone
                      // For emoji, we can't directly use SVG path. Instead, use label with Marker.
                      // To use an actual emoji, we'd typically use a label or a custom overlay.
                      // For simplicity with default Marker, let's use a distinct color or a simple icon.
                      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                      fillColor:
                        flightPlannedRouteColors[simulatedFlight.flightId] ||
                        '#0000FF', // Blue if color not found
                      fillOpacity: 1,
                      strokeWeight: 1,
                      strokeColor: '#FFFFFF',
                      scale: 5, // Make it more visible
                      // rotation: calculatedHeading, // You could calculate heading between current and next point
                    }}
                    label={{
                      text: '🚁', // Helicopter emoji
                      fontSize: '24px', // Adjust size as needed
                      color: '#000000', // Color of the emoji (some emojis are color-font based)
                    }}
                    zIndex={3}
                    onMouseOver={() =>
                      setHoveredFlightId(simulatedFlight.flightId)
                    }
                    onMouseOut={() => setHoveredFlightId(null)}
                  />
                ))}

              {hoveredFlightId != null &&
                (() => {
                  const flight = flights.find((f) => f.id === hoveredFlightId)
                  if (!flight) return null

                  const simulatedData = simulatedFlights[hoveredFlightId]
                  const livePosition = simulatedData?.currentPosition

                  const displayPosition = livePosition
                    ? { lat: livePosition.lat, lng: livePosition.lng }
                    : flight.waypoints && flight.waypoints.length > 0
                      ? {
                          lat: flight.waypoints[0].latitude,
                          lng: flight.waypoints[0].longitude,
                        }
                      : mapCenter

                  return (
                    <InfoWindow
                      position={displayPosition}
                      onCloseClick={() => setHoveredFlightId(null)}
                      options={{ zIndex: 4 }}
                    >
                      <div className="p-1 space-y-1 text-sm w-64">
                        <p className="font-bold text-base">
                          Flight ID: {flight.id}
                        </p>
                        <p>
                          <strong>Status:</strong>{' '}
                          <span
                            className={`font-semibold ${
                              flight.status === 'ACTIVE' ||
                              flight.status === 'APPROVED' ||
                              simulatedData?.status === 'ACTIVE'
                                ? 'text-green-600'
                                : flight.status.startsWith('REJECTED') ||
                                    flight.status.startsWith('CANCELLED')
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                            }`}
                          >
                            {simulatedData?.status === 'ACTIVE'
                              ? 'ACTIVE (Simulating)'
                              : simulatedData?.status === 'COMPLETED'
                                ? 'COMPLETED (Simulated)'
                                : flight.status}
                          </span>
                        </p>
                        <p>
                          <strong>Drone:</strong> {flight.drone_id}
                        </p>
                        {/* ... other flight info ... */}
                        {livePosition && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="font-semibold text-blue-600">
                              Simulated Position:
                            </p>
                            <p>
                              Lat: {livePosition.lat.toFixed(5)}, Lng:{' '}
                              {livePosition.lng.toFixed(5)}
                            </p>
                            {livePosition.altitude && (
                              <p>Alt: {livePosition.altitude.toFixed(1)}m</p>
                            )}
                            {livePosition.timestamp && (
                              <p>
                                Updated:{' '}
                                {new Date(
                                  livePosition.timestamp,
                                ).toLocaleTimeString()}
                              </p>
                            )}
                            <p>
                              Target WP Index: {livePosition.waypointIndex + 1}
                            </p>
                            <p>
                              Progress:{' '}
                              {(
                                livePosition.progressToNextWaypoint * 100
                              ).toFixed(0)}
                              %
                            </p>
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  )
                })()}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </div>
  )
}
