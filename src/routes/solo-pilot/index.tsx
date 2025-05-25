import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api'

export const Route = createFileRoute('/solo-pilot/')({
  component: SoloPilotDashboard,
})

const initialDrones = [
  { id: 'dr1', brand: 'DJI', model: 'Mavic Pro', serial_number: '1231312' },
  { id: 'dr2', brand: 'Parrot', model: 'Anafi', serial_number: '8833821' },
]

const mockFlightRequests = [
  {
    id: 'req1',
    drone: 'dr1',
    status: 'APPROVED',
    createdAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'req2',
    drone: 'dr2',
    status: 'PENDING',
    createdAt: '2024-05-04T14:30:00Z',
  },
]

function SoloPilotDashboard() {
  const [myDrones, setMyDrones] = useState(initialDrones)
  const [editDrone, setEditDrone] = useState<
    (typeof initialDrones)[number] | null
  >(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEdit = (drone: (typeof initialDrones)[number]) => {
    setEditDrone(drone)
    setIsDialogOpen(true)
  }

  const handleSaveDrone = () => {
    if (!editDrone) return
    setMyDrones((prev) => {
      const index = prev.findIndex((d) => d.id === editDrone.id)
      if (index === -1) return prev
      const updated = [...prev]
      updated[index] = editDrone
      return updated
    })
    setIsDialogOpen(false)
  }

  const handleAddNewDrone = () => {
    const newDrone = {
      id: crypto.randomUUID(),
      brand: '',
      model: '',
      serial_number: '',
    }
    setEditDrone(newDrone)
    setIsDialogOpen(true)
  }

  const qc = useQueryClient()
  const [flightForm, setFlightForm] = useState({
    drone_id: 'dr1',
    from: '',
    to: '',
    altitude: '',
    notes: '',
    waypoints: [] as google.maps.LatLngLiteral[],
  })

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
      console.log('[MOCK] Submit solo flight request:', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['solo-flight-requests'] })
    },
  })

  const { data: requests = [] } = useQuery({
    queryKey: ['solo-flight-requests'],
    queryFn: async () => mockFlightRequests,
  })

  const center = { lat: 51.13, lng: 71.43 }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Solo Pilot Dashboard</h1>
      {/* Drone Management */}
      <Card className="p-4">
        <h2 className="font-medium mb-4">Drone Management</h2>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Brand</th>
              <th className="text-left">Model</th>
              <th className="text-left">Serial Number</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {myDrones.map((d) => (
              <tr key={d.id} className="group hover:bg-muted border-t">
                <td>{d.brand}</td>
                <td>{d.model}</td>
                <td>{d.serial_number}</td>
                <td>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => handleEdit(d)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button className="mt-4" onClick={handleAddNewDrone}>
          + Add Drone
        </Button>
      </Card>
      {/* Drone Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editDrone?.id ? 'Edit Drone' : 'Add Drone'}
            </DialogTitle>
          </DialogHeader>
          {editDrone && (
            <div className="space-y-2">
              <Input
                placeholder="Brand"
                value={editDrone.brand}
                onChange={(e) =>
                  setEditDrone({ ...editDrone, brand: e.target.value })
                }
              />
              <Input
                placeholder="Model"
                value={editDrone.model}
                onChange={(e) =>
                  setEditDrone({ ...editDrone, model: e.target.value })
                }
              />
              <Input
                placeholder="Serial Number"
                value={editDrone.serial_number}
                onChange={(e) =>
                  setEditDrone({ ...editDrone, serial_number: e.target.value })
                }
              />
              <div className="flex justify-end gap-2">
                <Button onClick={handleSaveDrone}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* New Request with Map */}
      <Card className="p-4 space-y-2">
        <h2 className="font-medium">New Flight Request</h2>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '200px' }}
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
            value={flightForm.from}
            onChange={(e) =>
              setFlightForm({ ...flightForm, from: e.target.value })
            }
            className="appearance-none"
          />
          <Input
            type="datetime-local"
            value={flightForm.to}
            onChange={(e) =>
              setFlightForm({ ...flightForm, to: e.target.value })
            }
            className="appearance-none"
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
      {/* My Requests */}
      <Card className="p-4">
        <h2 className="font-medium mb-2">My Flight Requests</h2>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Status</th>
              <th>Created</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t">
                <td>{r.id}</td>
                <td>{r.status}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <Button variant="link" size="sm">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
