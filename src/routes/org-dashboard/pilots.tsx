// src/routes/org-dashboard/pilots.tsx
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
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useState } from 'react'
import { toast } from 'sonner'
import { mockPilots, mockAvailableDrones } from '@/api/org-dashboard/mock'
import type { PilotWithDrone, Drone } from '@/api/org-dashboard/types'

export const Route = createFileRoute('/org-dashboard/pilots')({
  component: PilotsPage,
})

function PilotsPage() {
  const { data: pilots = [], isPending } = useQuery({
    queryKey: ['org-pilots'],
    queryFn: async (): Promise<PilotWithDrone[]> => mockPilots,
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Pilots Assigned to Drones</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pilot</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Assigned Drone</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pilots.map((pilot) => (
            <TableRow key={pilot.id}>
              <TableCell>{pilot.full_name}</TableCell>
              <TableCell>{pilot.email}</TableCell>
              <TableCell>
                {pilot.assigned_drone?.serial_number ?? '—'}
              </TableCell>
              <TableCell className="text-right">
                <ManageDialog pilot={pilot} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ManageDialog({ pilot }: { pilot: PilotWithDrone }) {
  const [open, setOpen] = useState(false)
  const [selectedDroneId, setSelectedDroneId] = useState<string>()
  const qc = useQueryClient()

  const assign = useMutation({
    mutationFn: async ({
      pilotId,
      droneId,
    }: {
      pilotId: string
      droneId: string
    }) => {
      console.log('[MOCK] Assign', droneId, 'to', pilotId)
    },
    onSuccess: () => {
      toast.success('Drone assigned')
      qc.invalidateQueries({ queryKey: ['org-pilots'] })
      setOpen(false)
    },
  })

  const revoke = useMutation({
    mutationFn: async ({ pilotId }: { pilotId: string }) => {
      console.log('[MOCK] Revoke drone from', pilotId)
    },
    onSuccess: () => {
      toast.success('Drone revoked')
      qc.invalidateQueries({ queryKey: ['org-pilots'] })
      setOpen(false)
    },
  })

  const availableDrones = mockAvailableDrones

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        Manage
      </Button>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-lg font-medium">Manage: {pilot.full_name}</h2>
        </DialogHeader>
        {pilot.assigned_drone ? (
          <>
            <p>Assigned to: {pilot.assigned_drone.serial_number}</p>
            <Button
              variant="destructive"
              className="mt-4 w-full"
              onClick={() => revoke.mutate({ pilotId: pilot.id })}
            >
              Revoke Drone
            </Button>
          </>
        ) : (
          <>
            <Select value={selectedDroneId} onValueChange={setSelectedDroneId}>
              <SelectTrigger>
                <SelectValue placeholder="Select drone" />
              </SelectTrigger>
              <SelectContent>
                {availableDrones.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.serial_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="mt-4 w-full"
              disabled={!selectedDroneId}
              onClick={() =>
                assign.mutate({ pilotId: pilot.id, droneId: selectedDroneId! })
              }
            >
              Assign Drone
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
