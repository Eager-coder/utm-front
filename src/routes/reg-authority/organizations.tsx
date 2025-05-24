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
import { getOrganizations } from '@/api/organizations/getOrganizations'

export const Route = createFileRoute('/reg-authority/organizations')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    data: organizations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => getOrganizations(),
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
              <TableCell>{org.is_active}</TableCell>
              <TableCell>{org.bin}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
