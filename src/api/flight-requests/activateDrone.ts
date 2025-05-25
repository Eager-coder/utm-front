import apiClient from '../apiClient'

export const activateDrone = async (flight_plan_id: number) => {
  await apiClient.put(`/flights/${flight_plan_id}/start`)
}
