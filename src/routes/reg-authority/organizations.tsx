// src/routes/reg-authority/organizations.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table'

type Organization = {
  id: number
  name: string
  type: 'ORG' | 'SOLO'
  drones: number
}

const fetchOrganizations = async (): Promise<Organization[]> => {
  // TODO: replace with real API call, e.g.:
  // return fetch('/api/reg-authority/organizations').then(res => res.json())
  return [
    { id: 1, name: 'ORG_NAME1', type: 'ORG', drones: 4 },
    { id: 2, name: 'ORG_NAME2', type: 'ORG', drones: 15 },
    { id: 3, name: 'SOLO_RAPIST', type: 'SOLO', drones: 3 },
    { id: 4, name: 'ORG_NAME3', type: 'ORG', drones: 7 },
  ]
}

export const Route = createFileRoute('/reg-authority/organizations')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    data: organizations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['reg-authority', 'organizations'],
    queryFn: fetchOrganizations,
  })

  if (isLoading) {
    return <div className="p-8">Loading organizations…</div>
  }

  if (isError) {
    return (
      <div className="p-8 text-red-600">
        Error loading organizations. Please try again.
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Organizations / Solo</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Drones #</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                {org.id}. {org.name}
              </TableCell>
              <TableCell>{org.type}</TableCell>
              <TableCell>{org.drones}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
