import apiClient from '../apiClient'
import type { Drone } from './createDrone'

export const getMyDrones = async () => {
  const res = await apiClient.get<Drone[]>('/drones/my')
  return res.data
}
