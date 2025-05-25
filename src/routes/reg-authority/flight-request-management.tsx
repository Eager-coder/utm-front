import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type {
  FlightRequestDto,
  FlightRequestStatus,
} from '@/api/flight-requests/createFlightRequest'
import { updateFlightRequestStatus } from '@/api/flight-requests/updateFilghtRequestStatus'
import { getAllFlightRequests } from '@/api/flight-requests/getAllFlightRequests'
import { RegAuthorityNavbar } from '@/components/RegAuthorityNavbar'

export const Route = createFileRoute(
  '/reg-authority/flight-request-management',
)({
  component: RouteComponent,
})

export function RouteComponent() {
  const queryClient = useQueryClient()
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['flightRequests'],
    queryFn: getAllFlightRequests,
  })

  const mutation = useMutation({
    mutationFn: (params: { id: number; status: FlightRequestStatus }) =>
      updateFlightRequestStatus(params.id, { status: params.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flightRequests'] })
    },
  })

  const statuses: FlightRequestStatus[] = [
    'PENDING_ORG_APPROVAL',
    'PENDING_AUTHORITY_APPROVAL',
    'APPROVED',
    'REJECTED_BY_ORG',
    'REJECTED_BY_AUTHORITY',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED_BY_PILOT',
    'CANCELLED_BY_ADMIN',
  ]

  if (isLoading) {
    return <div>Loading flight requests...</div>
  }

  return (
    <div className="p-6">
      <RegAuthorityNavbar />
      <h1 className="text-2xl font-bold mb-4">Flight Request Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Drone</TableHead>
            <TableHead>Submitter</TableHead>
            <TableHead>Departure</TableHead>
            <TableHead>Arrival</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req: FlightRequestDto) => (
            <TableRow key={req.id}>
              <TableCell>{req.id}</TableCell>
              <TableCell>{req.drone.serial_number}</TableCell>
              <TableCell>
                {req.submitter_user?.full_name || 'no data'}
              </TableCell>
              <TableCell>
                {new Date(req.planned_departure_time).toLocaleString()}
              </TableCell>
              <TableCell>
                {new Date(req.planned_arrival_time).toLocaleString()}
              </TableCell>
              <TableCell>
                <Select
                  value={req.status}
                  onValueChange={(value) =>
                    mutation.mutate({
                      id: req.id,
                      status: value as FlightRequestStatus,
                    })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
