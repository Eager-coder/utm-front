// src/routes/org-dashboard/flights.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'

export const Route = createFileRoute('/org-dashboard/flights')({
  component: FlightPlansPage,
})

function FlightPlansPage() {
  const { data: flights = [], isPending } = useQuery({
    queryKey: ['org-flights'],
    queryFn: async () => [
      {
        id: 'fl1',
        pilot: 'Aliya Bakyt',
        drone: 'DJI Phantom 4',
        status: 'APPROVED',
        departure: '2024-05-01 10:00',
        arrival: '2024-05-01 10:45',
      },
    ], // 🔁 Replace with real API: GET /flights/organization
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Flight Plan History</h1>
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flight ID</TableHead>
              <TableHead>Pilot</TableHead>
              <TableHead>Drone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flights.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.pilot}</TableCell>
                <TableCell>{f.drone}</TableCell>
                <TableCell>{f.status}</TableCell>
                <TableCell>{f.departure}</TableCell>
                <TableCell>{f.arrival}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
