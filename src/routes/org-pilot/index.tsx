import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api'
// import { formatISO } from 'date-fns'

export const Route = createFileRoute('/org-pilot/')({
  component: OrgPilotDashboard,
})

const mockAssignedDrones = [
  { id: 'dr1', brand: 'DJI', model: 'Mavic Pro', serial_number: '1231312' },
  { id: 'dr2', brand: 'DJI', model: 'Birmarse', serial_number: '54623434' },
]

const mockRequests = [
  {
    id: 'fl1',
    drone: 'dr1',
    time: '10:00–11:00',
    status: 'APPROVED',
    submitted: '2024-05-25T08:00:00.000Z',
  },
  {
    id: 'fl2',
    drone: 'dr2',
    time: '13:00–14:00',
    status: 'PENDING',
    submitted: '2024-05-25T09:30:00.000Z',
  },
]

function OrgPilotDashboard() {
  const [flightForm, setFlightForm] = useState({
    drone_id: 'dr1',
    from: '',
    to: '',
    altitude: '',
    notes: '',
    waypoints: [] as google.maps.LatLngLiteral[],
  })

  const qc = useQueryClient()

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const coord = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      setFlightForm((prev) => ({
        ...prev,
        waypoints: [...prev.waypoints, coord],
      }))
    }
  }

  const handleDrag = (e: google.maps.MapMouseEvent, index: number) => {
    if (e.latLng) {
      const updated = [...flightForm.waypoints]
      updated[index] = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      setFlightForm({ ...flightForm, waypoints: updated })
    }
  }

  const removeWaypoint = (index: number) => {
    const updated = flightForm.waypoints.filter((_, i) => i !== index)
    setFlightForm({ ...flightForm, waypoints: updated })
  }

  const submitFlight = useMutation({
    mutationFn: async () => {
      const payload = {
        ...flightForm,
        from: new Date(flightForm.from).toISOString(),
        to: new Date(flightForm.to).toISOString(),
      }
      console.log('🔁 [MOCK] Submitting flight plan', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pilot-requests'] })
    },
  })

  const { data: requests = [] } = useQuery({
    queryKey: ['pilot-requests'],
    queryFn: async () => mockRequests,
  })

  const center = { lat: 51.13, lng: 71.43 }
  const containerStyle = { width: '100%', height: '200px' }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Organization Pilot Dashboard</h1>

      {/* Assigned drones */}
      <Card className="p-4">
        <h2 className="font-medium mb-2">My Assigned Drones</h2>
        <ul className="text-sm space-y-1">
          {mockAssignedDrones.map((d) => (
            <li key={d.id}>
              {d.brand} {d.model} — <code>{d.serial_number}</code>
            </li>
          ))}
        </ul>
      </Card>

      {/* Flight request form */}
      <Card className="p-4 space-y-2">
        <h2 className="font-medium">Submit New Flight Request</h2>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            onClick={handleMapClick}
          >
            {flightForm.waypoints.map((point, idx) => (
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
              path={flightForm.waypoints}
              options={{ strokeColor: '#007bff', strokeWeight: 2 }}
            />
          </GoogleMap>
        </LoadScript>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="datetime-local"
            className="[appearance:textfield]"
            placeholder="Start Time"
            value={flightForm.from}
            onChange={(e) =>
              setFlightForm({ ...flightForm, from: e.target.value })
            }
          />
          <Input
            type="datetime-local"
            className="[appearance:textfield]"
            placeholder="End Time"
            value={flightForm.to}
            onChange={(e) =>
              setFlightForm({ ...flightForm, to: e.target.value })
            }
          />
          <Input
            placeholder="Altitude (m)"
            value={flightForm.altitude}
            onChange={(e) =>
              setFlightForm({ ...flightForm, altitude: e.target.value })
            }
          />
        </div>
        <Textarea
          placeholder="Notes"
          value={flightForm.notes}
          onChange={(e) =>
            setFlightForm({ ...flightForm, notes: e.target.value })
          }
        />
        <Button onClick={() => submitFlight.mutate()}>Submit</Button>
      </Card>

      {/* Current Requests */}
      <Card className="p-4">
        <h2 className="font-medium mb-2">Current Requests</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Drone</th>
              <th>Time</th>
              <th>Status</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t">
                <td>{r.drone}</td>
                <td>{r.time}</td>
                <td>{r.status}</td>
                <td>{r.submitted}</td>
                <td>
                  {r.status === 'APPROVED' && (
                    <Button variant="outline" size="sm">
                      Start Flight
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
