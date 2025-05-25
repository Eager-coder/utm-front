import apiClient from '../apiClient'
import type { FlightRequestDto } from './createFlightRequest'

export const getMyFlighRequests = async () => {
  return (await apiClient.get<FlightRequestDto[]>('/flights/my')).data
}
