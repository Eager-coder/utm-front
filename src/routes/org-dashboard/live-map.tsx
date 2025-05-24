// src/routes/org-dashboard/live-map.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { Card } from '@/components/ui/card'

export const Route = createFileRoute('/org-dashboard/live-map')({
  component: LiveMapPage,
})

const mockDrones = [
  { id: 'drone1', lat: 51.13, lng: 71.43, status: 'ACTIVE', pilot: 'pilot1' },
  { id: 'drone2', lat: 51.14, lng: 71.42, status: 'ACTIVE', pilot: 'pilot2' },
  { id: 'drone3', lat: 51.12, lng: 71.44, status: 'LOST', pilot: 'pilot3' },
  { id: 'drone4', lat: 51.11, lng: 71.45, status: 'LOST', pilot: 'pilot4' },
  { id: 'drone12', lat: 51.1, lng: 71.46, status: 'STATION' },
  { id: 'drone36', lat: 51.09, lng: 71.47, status: 'STATION' },
]

function LiveMapPage() {
  const { data: drones = [] } = useQuery({
    queryKey: ['live-drones'],
    queryFn: async () => mockDrones, // 🔁 Replace with GET /telemetry/live or /drones/my
  })

  const center = { lat: 51.13, lng: 71.43 }
  const containerStyle = { width: '100%', height: '100%' }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Live Map with Drones</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 h-[400px]">
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
          >
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={14}
            >
              {drones.map((d) => (
                <Marker
                  key={d.id}
                  position={{ lat: d.lat, lng: d.lng }}
                  label={d.id}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </Card>
        <Card className="p-4 space-y-2">
          <h2 className="font-medium">Filter by status:</h2>
          <div>
            <strong>ACTIVE</strong>
            <ul className="text-sm">
              {drones
                .filter((d) => d.status === 'ACTIVE')
                .map((d) => (
                  <li key={d.id}>
                    {d.id} – {d.pilot}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <strong>LOST CONNECTION</strong>
            <ul className="text-sm">
              {drones
                .filter((d) => d.status === 'LOST')
                .map((d) => (
                  <li key={d.id}>
                    {d.id} – {d.pilot}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <strong>ON STATION</strong>
            <ul className="text-sm">
              {drones
                .filter((d) => d.status === 'STATION')
                .map((d) => (
                  <li key={d.id}>{d.id}</li>
                ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
