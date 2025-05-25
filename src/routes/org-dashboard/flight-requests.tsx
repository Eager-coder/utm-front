// src/routes/org-dashboard/flight-requests.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getMyDrones } from '@/api/drone-management/getMyDrones'
import type { Drone } from '@/api/drone-management/createDrone'
import {
  createFlightRequest,
  type CreateFlightRequest as CreateFlightRequestPayload,
  type Waypoint,
} from '@/api/flight-requests/createFlightRequest'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api'

export const Route = createFileRoute('/org-dashboard/flight-requests')({
  component: NewFlightRequest,
})

function NewFlightRequest() {
  const [form, setForm] = useState({
    planned_departure_time: '',
    planned_arrival_time: '',
    altitude_m: '', // Assuming this is a string for input, will parse to number
    notes: '',
    waypoints: [] as google.maps.LatLngLiteral[],
    drone_id: '',
  })

  const { data: drones, isLoading: dronesLoading } = useQuery<Drone[], Error>({
    queryKey: ['myDrones'],
    queryFn: getMyDrones,
  })

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation<any, Error, CreateFlightRequestPayload>({
    mutationFn: createFlightRequest,
    onSuccess: () => {
      toast.success('Flight request created successfully!')
      queryClient.invalidateQueries({ queryKey: ['flightRequests'] }) // Assuming you have a query for listing flight requests
      // Potentially navigate away or reset form
      // navigate({ to: '/org-dashboard/flights' }); // Example navigation
      setForm({
        planned_departure_time: '',
        planned_arrival_time: '',
        altitude_m: '',
        notes: '',
        waypoints: [],
        drone_id: '',
      })
    },
    onError: (error) => {
      toast.error(`Failed to create flight request: ${error.message}`)
    },
  })

  const center = { lat: 51.13, lng: 71.43 }
  const containerStyle = { width: '100%', height: '300px' }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setForm((prev) => {
        if (!e.latLng) return prev
        const newWaypoints = [...prev.waypoints]
        newWaypoints.push({ lat: e.latLng.lat(), lng: e.latLng.lng() })
        return { ...prev, waypoints: newWaypoints }
      })
    }
  }

  const handleDrag = (e: google.maps.MapMouseEvent, index: number) => {
    if (e.latLng) {
      const updated = [...form.waypoints]
      updated[index] = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      setForm({ ...form, waypoints: updated })
    }
  }

  const removeWaypoint = (index: number) => {
    const updated = form.waypoints.filter((_, i) => i !== index)
    setForm({ ...form, waypoints: updated })
  }

  const handleSubmit = () => {
    if (!form.drone_id) {
      toast.error('Please select a drone.')
      return
    }
    if (form.waypoints.length === 0) {
      toast.error('Please add at least one waypoint on the map.')
      return
    }
    if (!form.planned_departure_time || !form.planned_arrival_time) {
      toast.error('Please select departure and arrival times.')
      return
    }
    if (!form.altitude_m) {
      toast.error('Please enter an altitude.')
      return
    }

    const waypointsPayload: Waypoint[] = form.waypoints.map((wp, index) => ({
      latitude: wp.lat,
      longitude: wp.lng,
      altitude_m: parseFloat(form.altitude_m), // Use the single altitude for all waypoints
      sequence_order: index + 1,
    }))

    const payload: CreateFlightRequestPayload = {
      drone_id: parseInt(form.drone_id, 10),
      planned_departure_time: new Date(
        form.planned_departure_time,
      ).toISOString(),
      planned_arrival_time: new Date(form.planned_arrival_time).toISOString(),
      notes: form.notes, // API expects 'string', not string[] - ensure this matches API spec
      waypoints: waypointsPayload,
    }

    console.log('Submitting new flight request:', payload)
    mutation.mutate(payload)
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">New Flight Request</h1>

      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onClick={handleMapClick}
        >
          {form.waypoints.map((point, idx) => (
            <Marker
              key={idx}
              position={point}
              label={`${idx + 1}`}
              draggable
              onDragEnd={(e) => handleDrag(e, idx)}
              onRightClick={() => removeWaypoint(idx)}
            />
          ))}
          <Polyline
            path={form.waypoints}
            options={{ strokeColor: '#007bff', strokeWeight: 2 }}
          />
        </GoogleMap>
      </LoadScript>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="drone_id">Select Drone</Label>
          <Select
            value={form.drone_id}
            onValueChange={(value) => setForm({ ...form, drone_id: value })}
            disabled={dronesLoading}
          >
            <SelectTrigger id="drone_id">
              <SelectValue
                placeholder={
                  dronesLoading ? 'Loading drones...' : 'Select a drone'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {drones?.map((drone) => (
                <SelectItem key={drone.id} value={String(drone.id)}>
                  {drone.brand} {drone.model} (SN: {drone.serial_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="altitude">Altitude (m)</Label>
          <Input
            id="altitude"
            placeholder="Altitude (m) for all waypoints"
            type="number"
            value={form.altitude_m}
            onChange={(e) => setForm({ ...form, altitude_m: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="departure_time">Planned Departure Time</Label>
          <Input
            id="departure_time"
            type="datetime-local"
            value={form.planned_departure_time}
            onChange={(e) =>
              setForm({ ...form, planned_departure_time: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="arrival_time">Planned Arrival Time</Label>
          <Input
            id="arrival_time"
            type="datetime-local"
            value={form.planned_arrival_time}
            onChange={(e) =>
              setForm({ ...form, planned_arrival_time: e.target.value })
            }
          />
        </div>
      </div>
      <Textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      <Button onClick={handleSubmit} disabled={mutation.isPending}>
        {mutation.isPending ? 'Submitting...' : 'Submit Flight Request'}
      </Button>
    </div>
  )
}
