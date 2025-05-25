// src/routes/reg-authority/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getOrganizations } from '@/api/organizations/getOrganizations'
import { getSoloPilots } from '@/api/organizations/getUsers'

export const Route = createFileRoute('/reg-authority/')({
  component: RegulatoryDashboard,
})

const API_URL = import.meta.env.VITE_API_URL

function RegulatoryDashboard() {
  const [view, setView] = useState<'org' | 'solo'>('org')

  const { data: organizations = [], isLoading: orgLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => getOrganizations(),
  })

  const { data: soloPilots = [], isLoading: soloLoading } = useQuery({
    queryKey: ['solo-pilots'],
    queryFn: async () => getSoloPilots(),
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Regulatory Authority Dashboard</h1>

      <div className="flex gap-4">
        <Button
          variant={view === 'org' ? 'default' : 'outline'}
          onClick={() => setView('org')}
        >
          Organizations
        </Button>
        <Button
          variant={view === 'solo' ? 'default' : 'outline'}
          onClick={() => setView('solo')}
        >
          Solo Pilots
        </Button>
      </div>

      <div className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {view === 'org' && <TableHead>City</TableHead>}
              {view === 'org' && <TableHead>BIN</TableHead>}
              {view === 'solo' && <TableHead>Email</TableHead>}
              {view === 'solo' && <TableHead>Phone</TableHead>}
              {view === 'solo' && <TableHead>IIN</TableHead>}
              <TableHead>Created At</TableHead>
              <TableHead>Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {view === 'org' &&
              !orgLoading &&
              organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{org.city}</TableCell>
                  <TableCell>{org.bin}</TableCell>
                  <TableCell>
                    {new Date(org.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{org.is_active ? '✓' : '✘'}</TableCell>
                </TableRow>
              ))}
            {view === 'solo' &&
              !soloLoading &&
              soloPilots.map((pilot) => (
                <TableRow key={pilot.id}>
                  <TableCell>{pilot.full_name}</TableCell>
                  <TableCell>{pilot.email}</TableCell>
                  <TableCell>{pilot.phone_number}</TableCell>
                  <TableCell>{pilot.iin}</TableCell>
                  <TableCell>
                    {new Date(pilot.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{pilot.is_active ? '✓' : '✘'}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {(orgLoading || soloLoading) && (
          <p className="text-muted-foreground mt-4">Loading...</p>
        )}
      </div>
    </div>
  )
}
