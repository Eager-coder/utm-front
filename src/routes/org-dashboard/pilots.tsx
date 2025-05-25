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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
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
// import type { PilotWithDrone, Drone as AssignedDrone } from '@/api/org-dashboard/types'; // Renaming to avoid conflict
import type { PilotWithDrone } from '@/api/org-dashboard/types' // PilotWithDrone might still use its own Drone type definition from mock or types.ts

import {
  createDrone,
  type Drone,
  type DroneStatus,
} from '@/api/drone-management/createDrone' // Assuming createDrone.ts exports these
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { getMyDrones } from '@/api/drone-management/getMyDrones'
import { deleteDrone } from '@/api/drone-management/deleteDrone'
import {
  updateDrone,
  type UpdateDroneRequest,
} from '@/api/drone-management/updateDrone'

export const Route = createFileRoute('/org-dashboard/pilots')({
  component: PilotsPage,
})

const DRONE_STATUSES: DroneStatus[] = [
  'IDLE',
  'ACTIVE',
  'MAINTENANCE',
  'UNKNOWN',
]

function PilotsPage() {
  const { data: pilots = [] } = useQuery({
    queryKey: ['org-pilots'],
    queryFn: async (): Promise<PilotWithDrone[]> => mockPilots,
  })

  const {
    data: drones = [],
    isPending: dronesLoading,
    refetch: refetchDrones,
  } = useQuery({
    queryKey: ['my-drones'],
    queryFn: getMyDrones,
  })

  const queryClient = useQueryClient()

  const deleteDroneMutation = useMutation({
    mutationFn: deleteDrone,
    onSuccess: () => {
      toast.success('Drone deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['my-drones'] })
    },
    onError: (error) => {
      toast.error(`Failed to delete drone: ${error.message}`)
    },
  })

  const handleDeleteDrone = (droneId: number) => {
    if (window.confirm('Are you sure you want to delete this drone?')) {
      deleteDroneMutation.mutate(droneId)
    }
  }

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

      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Drones</h2>
          <DroneFormDialog onSuccess={refetchDrones} />
        </div>
        {dronesLoading ? (
          <p>Loading drones...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drones.map((drone) => (
                <TableRow key={drone.id}>
                  <TableCell>{drone.brand}</TableCell>
                  <TableCell>{drone.model}</TableCell>
                  <TableCell>{drone.serial_number}</TableCell>
                  <TableCell>{drone.current_status}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <DroneFormDialog drone={drone} onSuccess={refetchDrones} />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDrone(drone.id)}
                      disabled={deleteDroneMutation.isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

interface DroneFormDialogProps {
  drone?: Drone
  onSuccess?: () => void
}

function DroneFormDialog({ drone, onSuccess }: DroneFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [brand, setBrand] = useState(drone?.brand ?? '')
  const [model, setModel] = useState(drone?.model ?? '')
  const [serialNumber, setSerialNumber] = useState(drone?.serial_number ?? '')
  const [currentStatus, setCurrentStatus] = useState<DroneStatus>(
    drone?.current_status ?? 'IDLE',
  )
  const queryClient = useQueryClient()

  const droneMutation = useMutation({
    mutationFn: async (data: {
      brand: string
      model: string
      serial_number: string
      current_status: DroneStatus
    }) => {
      if (drone) {
        // Update existing drone
        const updateData: UpdateDroneRequest = {
          brand: data.brand,
          model: data.model,
          current_status: data.current_status,
        }
        // Serial number is not part of UpdateDroneRequest based on viewed file
        return updateDrone(drone.id, updateData)
      } else {
        // Create new drone
        // Assuming organization_id is not needed or handled by backend for 'my' drones
        return createDrone({
          brand: data.brand,
          model: data.model,
          serial_number: data.serial_number,
        })
      }
    },
    onSuccess: () => {
      toast.success(`Drone ${drone ? 'updated' : 'created'} successfully`)
      queryClient.invalidateQueries({ queryKey: ['my-drones'] })
      if (onSuccess) onSuccess()
      setOpen(false)
      // Reset form for create mode
      if (!drone) {
        setBrand('')
        setModel('')
        setSerialNumber('')
        setCurrentStatus('IDLE')
      }
    },
    onError: (error) => {
      toast.error(
        `Failed to ${drone ? 'update' : 'create'} drone: ${error.message}`,
      )
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand || !model || !serialNumber) {
      toast.error('Brand, Model, and Serial Number are required.')
      return
    }
    droneMutation.mutate({
      brand,
      model,
      serial_number: serialNumber,
      current_status: currentStatus,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={drone ? 'sm' : 'default'}
          variant={drone ? 'outline' : 'default'}
        >
          {drone ? 'Edit' : 'Create Drone'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{drone ? 'Edit Drone' : 'Create New Drone'}</DialogTitle>
          <DialogDescription>
            {drone
              ? 'Update the details of your drone.'
              : 'Enter the details for the new drone.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              required
              disabled={!!drone} // Serial number usually not editable
            />
          </div>
          {drone && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={currentStatus}
                onValueChange={(value) =>
                  setCurrentStatus(value as DroneStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {DRONE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={droneMutation.isPending}>
              {droneMutation.isPending
                ? 'Saving...'
                : drone
                  ? 'Save Changes'
                  : 'Create Drone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
