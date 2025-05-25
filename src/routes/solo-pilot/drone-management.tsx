import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyDrones } from '@/api/drone-management/getMyDrones'
import { createDrone } from '@/api/drone-management/createDrone'
import { updateDrone } from '@/api/drone-management/updateDrone'
import { deleteDrone } from '@/api/drone-management/deleteDrone'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { SoloPilotNavbar } from '@/components/SoloPilotNavbar'

export const Route = createFileRoute('/solo-pilot/drone-management')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const { data: drones = [], isLoading } = useQuery({
    queryKey: ['myDrones'],
    queryFn: getMyDrones,
  })

  const addMutation = useMutation({
    mutationFn: createDrone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDrones'] })
      toast.success('Drone added successfully')
      setAddOpen(false)
    },
    onError: () => toast.error('Failed to add drone'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateDrone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDrones'] })

      toast.success('Drone updated successfully')
      setEditOpen(false)
    },
    onError: () => toast.error('Failed to update drone'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDrone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDrones'] })

      toast.success('Drone deleted successfully')
    },
    onError: () => toast.error('Failed to delete drone'),
  })

  // Modal state
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({ brand: '', model: '', serial_number: '' })
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const openAdd = () => {
    setForm({ brand: '', model: '', serial_number: '' })
    setAddOpen(true)
  }

  const openEdit = (drone: any) => {
    setForm({
      brand: drone.brand,
      model: drone.model,
      serial_number: drone.serial_number,
    })
    setSelectedId(drone.id)
    setEditOpen(true)
  }

  const handleSubmitAdd = () => {
    addMutation.mutate(form)
  }

  const handleSubmitEdit = () => {
    if (selectedId != null) {
      updateMutation.mutate({ id: selectedId, data: form })
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <SoloPilotNavbar />

      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Drones</h2>
        <Button onClick={openAdd}>Add Drone</Button>
      </div>

      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              drones.map((drone) => (
                <TableRow key={drone.id}>
                  <TableCell>{drone.id}</TableCell>
                  <TableCell>{drone.brand}</TableCell>
                  <TableCell>{drone.model}</TableCell>
                  <TableCell>{drone.serial_number}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(drone)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(drone.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Drone Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Drone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                value={form.serial_number}
                onChange={(e) =>
                  setForm({ ...form, serial_number: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitAdd} disabled={addMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Drone Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Drone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brand-edit">Brand</Label>
              <Input
                id="brand-edit"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="model-edit">Model</Label>
              <Input
                id="model-edit"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="serial-edit">Serial Number</Label>
              <Input
                id="serial-edit"
                value={form.serial_number}
                onChange={(e) =>
                  setForm({ ...form, serial_number: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmitEdit}
              disabled={updateMutation.isPending}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
