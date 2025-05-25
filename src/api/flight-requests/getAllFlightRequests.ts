import apiClient from '../apiClient'
import type { FlightRequestDto } from './createFlightRequest'

export const getAllFlightRequests = async () => {
  const res = await apiClient.get<FlightRequestDto[]>('/flights/admin/all')
  return res.data
}
