// src/routes/org-dashboard/flight-requests.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getMyDrones } from '@/api/drone-management/getMyDrones'
import type { Drone } from '@/api/drone-management/createDrone'
import type { FlightRequestDto } from '@/api/flight-requests/createFlightRequest'
import {
  createFlightRequest,
  type CreateFlightRequest as CreateFlightRequestPayload,
  type Waypoint,
} from '@/api/flight-requests/createFlightRequest'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { getMyFlighRequests } from '@/api/flight-requests/getMyFlightRequests'

export const Route = createFileRoute('/solo-pilot/')({
  component: FlightRequests,
})

function FlightRequests() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: flights = [], isLoading: loadingFlights } = useQuery<
    FlightRequestDto[]
  >({
    queryKey: ['myFlights'],
    queryFn: getMyFlighRequests,
  })
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <div className="p-6 flex h-full">
      {/* Sidebar with list and create button */}
      <div className="w-1/3 pr-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Flight Requests</h2>
          <Button onClick={() => setIsOpen(true)}>Create</Button>
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

        {/* Create Request Modal */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild />
          <DialogContent className="w-[90vw] max-w-4xl">
            <DialogHeader>
              <DialogTitle>New Flight Request</DialogTitle>
              <DialogDescription>
                Fill out the details below and set waypoints on map.
              </DialogDescription>
            </DialogHeader>
            <NewFlightRequest onClose={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Map displaying all routes */}
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
              const path = flight.waypoints as Waypoint[]
              return (
                <Polyline
                  key={flight.id}
                  path={path.map((wp) => ({
                    lat: wp.latitude,
                    lng: wp.longitude,
                  }))}
                  options={{
                    strokeColor:
                      flight.id === hoveredId ? '#FF0000' : '#AA0000',
                    strokeWeight: flight.id === hoveredId ? 6 : 2,
                  }}
                  onMouseOver={() => setHoveredId(flight.id)}
                  onMouseOut={() => setHoveredId(null)}
                />
              )
            })}

            {flights.map((flight) =>
              (flight.waypoints as Waypoint[]).map((wp, idx) => (
                <Marker
                  key={`${flight.id}-${idx}`}
                  position={{ lat: wp.latitude, lng: wp.longitude }}
                  onMouseOver={() => setHoveredId(flight.id)}
                  onMouseOut={() => setHoveredId(null)}
                >
                  {hoveredId === flight.id && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <div />
                      </PopoverTrigger>
                      <PopoverContent>
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
                            <strong>Notes:</strong> {flight.notes.join(', ')}
                          </p>
                        )}
                      </PopoverContent>
                    </Popover>
                  )}
                </Marker>
              )),
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  )
}

interface NewFlightRequestProps {
  onClose: () => void
}

function NewFlightRequest({ onClose }: NewFlightRequestProps) {
  const [form, setForm] = useState({
    planned_departure_time: '',
    planned_arrival_time: '',
    altitude_m: '',
    notes: '',
    waypoints: [] as google.maps.LatLngLiteral[],
    drone_id: '',
  })

  const { data: drones, isLoading: dronesLoading } = useQuery<Drone[], Error>({
    queryKey: ['myDrones'],
    queryFn: getMyDrones,
  })
  const queryClient = useQueryClient()

  useEffect(() => {
    if (drones && drones.length > 0) {
      setForm((prev) => ({ ...prev, drone_id: String(drones[0].id) }))
    }
  }, [drones])

  const mutation = useMutation<any, Error, CreateFlightRequestPayload>({
    mutationFn: createFlightRequest,
    onSuccess: () => {
      toast.success('Flight request created successfully!')
      queryClient.invalidateQueries({ queryKey: ['myFlights'] })
      onClose()
    },
    onError: (error) => {
      toast.error(`Failed to create flight request: ${error.message}`)
    },
  })

  const center = { lat: 51.13, lng: 71.43 }
  const containerStyle = { width: '100%', height: '400px' }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setForm((prev) => ({
        ...prev,
        waypoints: [
          ...prev.waypoints,
          { lat: e.latLng.lat(), lng: e.latLng.lng() },
        ],
      }))
    }
  }

  const handleDrag = (e: google.maps.MapMouseEvent, idx: number) => {
    if (e.latLng) {
      const updated = [...form.waypoints]
      updated[idx] = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      setForm((prev) => ({ ...prev, waypoints: updated }))
    }
  }

  const removeWaypoint = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = () => {
    if (!form.drone_id) return toast.error('No drone available.')
    if (form.waypoints.length === 0)
      return toast.error('Add at least one waypoint.')
    if (!form.planned_departure_time || !form.planned_arrival_time)
      return toast.error('Select departure and arrival times.')
    if (!form.altitude_m) return toast.error('Enter altitude.')

    const waypointsPayload: Waypoint[] = form.waypoints.map((wp, i) => ({
      latitude: wp.lat,
      longitude: wp.lng,
      altitude_m: parseFloat(form.altitude_m),
      sequence_order: i + 1,
    }))

    const payload: CreateFlightRequestPayload = {
      drone_id: parseInt(form.drone_id, 10),
      planned_departure_time: new Date(
        form.planned_departure_time,
      ).toISOString(),
      planned_arrival_time: new Date(form.planned_arrival_time).toISOString(),
      notes: form.notes.split(',').map((n) => n.trim()),
      waypoints: waypointsPayload,
    }

    mutation.mutate(payload)
  }

  return (
    <div className="space-y-4">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onClick={handleMapClick}
        >
          {form.waypoints.map((pt, i) => (
            <Marker
              key={i}
              position={pt}
              label={`${i + 1}`}
              draggable
              onDragEnd={(e) => handleDrag(e, i)}
              onRightClick={() => removeWaypoint(i)}
            />
          ))}
          <Polyline
            path={form.waypoints}
            options={{ strokeColor: '#007bff', strokeWeight: 2 }}
          />
        </GoogleMap>
      </LoadScript>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Drone</Label>
          {dronesLoading ? (
            <p>Loading...</p>
          ) : drones && drones.length > 0 ? (
            <p>{`${drones[0].brand} ${drones[0].model} (SN: ${drones[0].serial_number})`}</p>
          ) : (
            <p>No drones available</p>
          )}
        </div>
        <div>
          <Label htmlFor="altitude">Altitude (m)</Label>
          <Input
            id="altitude"
            type="number"
            placeholder="Altitude (m)"
            value={form.altitude_m}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, altitude_m: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="departure_time">Departure Time</Label>
          <Input
            id="departure_time"
            type="datetime-local"
            value={form.planned_departure_time}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                planned_departure_time: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <Label htmlFor="arrival_time">Arrival Time</Label>
          <Input
            id="arrival_time"
            type="datetime-local"
            value={form.planned_arrival_time}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                planned_arrival_time: e.target.value,
              }))
            }
          />
        </div>
      </div>

      <Textarea
        placeholder="Notes (comma-separated)"
        value={form.notes}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, notes: e.target.value }))
        }
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  )
}
