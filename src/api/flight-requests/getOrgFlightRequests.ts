import apiClient from '../apiClient'
import type { FlightRequestDto } from './createFlightRequest'

export const getOrgFlightRequests = async () => {
  return (await apiClient.get<FlightRequestDto[]>('/flights/organization')).data
}
