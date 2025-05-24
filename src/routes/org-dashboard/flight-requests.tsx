// src/routes/org-dashboard/flight-requests.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/org-dashboard/flight-requests')({
  component: FlightRequestsPage,
})

const mockFlightRequests = [
  {
    id: 'req1',
    pilot: 'John Doe',
    drone: 'Phantom 4',
    route: 'A → B',
    time: '2024-05-24 09:00',
    altitude: '120m',
    status: 'pending',
  },
  {
    id: 'req2',
    pilot: 'Aliya Bakyt',
    drone: 'Mavic Air',
    route: 'C → D',
    time: '2024-05-24 12:00',
    altitude: '100m',
    status: 'approved',
  },
]

function FlightRequestsPage() {
  const { data: requests = [] } = useQuery({
    queryKey: ['org-flight-requests'],
    queryFn: async () => mockFlightRequests, // 🔁 Replace with GET /flights/organization?status=pending
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Flight Requests Dashboard</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Requests</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell>
                {req.pilot} – {req.drone} – {req.route} – {req.time} –{' '}
                {req.altitude}
              </TableCell>
              <TableCell>{req.status}</TableCell>
              <TableCell className="text-right">
                <RequestDialog request={req} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function RequestDialog({
  request,
}: {
  request: (typeof mockFlightRequests)[number]
}) {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const updateStatus = useMutation({
    mutationFn: async ({ status }: { status: 'approved' | 'rejected' }) => {
      console.log(`🔁 [MOCK] Set request ${request.id} to ${status}`)
    },
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['org-flight-requests'] })
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Manage
      </Button>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-lg font-medium">Flight Request</h2>
        </DialogHeader>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Pilot:</strong> {request.pilot}
          </p>
          <p>
            <strong>Drone:</strong> {request.drone}
          </p>
          <p>
            <strong>Route:</strong> {request.route}
          </p>
          <p>
            <strong>Time:</strong> {request.time}
          </p>
          <p>
            <strong>Altitude:</strong> {request.altitude}
          </p>
          <p>
            <strong>Restricted Zone:</strong> Checked ✅
          </p>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="destructive"
            onClick={() => updateStatus.mutate({ status: 'rejected' })}
          >
            Reject
          </Button>
          <Button onClick={() => updateStatus.mutate({ status: 'approved' })}>
            Approve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
