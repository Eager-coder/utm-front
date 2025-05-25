import apiClient from '../apiClient'

export const deleteDrone = async (droneId: number) => {
  await apiClient.delete(`/drones/${droneId}`)
}
