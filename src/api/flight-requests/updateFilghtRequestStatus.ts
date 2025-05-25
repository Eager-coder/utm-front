import apiClient from '../apiClient'

import type {
  FlightRequestDto,
  FlightRequestStatus,
} from './createFlightRequest'

export interface UpdateFlightRequestStatusRequest {
  status: FlightRequestStatus
  rejection_reason?: string
}

export const updateFlightRequestStatus = async (
  flightId: number,
  data: UpdateFlightRequestStatusRequest,
) => {
  const res = await apiClient.put<FlightRequestDto>(
    `/flights/${flightId}/status`,
    data,
  )
  return res.data
}
