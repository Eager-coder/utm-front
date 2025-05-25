import apiClient from '../apiClient'

export interface Waypoint {
  latitude: number
  longitude: number
  altitude_m: number
  sequence_order: number
}

export interface CreateFlightRequest {
  drone_id: number
  planned_departure_time: string
  planned_arrival_time: string
  notes: string
  waypoints: Waypoint[]
}

export interface FlightRequestDto {
  drone_id: number
  planned_departure_time: string // ISO date-time string
  planned_arrival_time: string // ISO date-time string
  notes?: (string | null)[]
  id: number
  user_id: number
  organization_id?: number | null
  status:
    | 'PENDING_ORG_APPROVAL'
    | 'PENDING_AUTHORITY_APPROVAL'
    | 'APPROVED'
    | 'REJECTED_BY_ORG'
    | 'REJECTED_BY_AUTHORITY'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'CANCELLED_BY_PILOT'
    | 'CANCELLED_BY_ADMIN'
  actual_departure_time?: string | null // ISO date-time or null
  actual_arrival_time?: string | null // ISO date-time or null
  rejection_reason?: string | null
  approved_by_organization_admin_id?: number | null
  approved_by_authority_admin_id?: number | null
  approved_at?: string | null // ISO date-time or null
  created_at: string // ISO date-time string
  updated_at: string // ISO date-time string
}

export const createFlightRequest = async (data: CreateFlightRequest) => {
  const res = await apiClient.post<FlightRequestDto>(`/flights`, data)
  return res.data
}
