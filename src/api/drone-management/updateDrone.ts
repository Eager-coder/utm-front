import apiClient from '../apiClient'
import type { Drone, DroneStatus } from './createDrone'

export interface UpdateDroneRequest {
  brand: string
  model: string
  current_status: DroneStatus
}

export const updateDrone = async (
  droneId: number,
  data: UpdateDroneRequest,
) => {
  const response = await apiClient.put<Drone>(`/drones/${droneId}`, data)
  return response.data
}
