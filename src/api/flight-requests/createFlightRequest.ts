import apiClient from '../apiClient'

export interface CreateFlightRequest {
  drone_id: number
  planned_departure_time: string
  planned_arrival_time: string
  notes: string
  waypoints: CrateaWaypoint[]
}

export type FlightRequestStatus =
  | 'PENDING_ORG_APPROVAL'
  | 'PENDING_AUTHORITY_APPROVAL'
  | 'APPROVED'
  | 'REJECTED_BY_ORG'
  | 'REJECTED_BY_AUTHORITY'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED_BY_PILOT'
  | 'CANCELLED_BY_ADMIN'

export interface FlightRequestDto {
  drone_id: number
  planned_departure_time: string // ISO date-time
  planned_arrival_time: string // ISO date-time
  notes?: string | null
  id: number
  user_id: number
  organization_id?: number | null
  status: FlightRequestStatus
  actual_departure_time?: string | null
  actual_arrival_time?: string | null
  rejection_reason?: string | null
  approved_by_organization_admin_id?: number | null
  approved_by_authority_admin_id?: number | null
  approved_at?: string | null
  created_at: string // ISO date-time
  updated_at: string // ISO date-time

  drone: DroneDto
  waypoints: WaypointDto[]
  submitter_user: SubmitterUserDto
}

export interface DroneDto {
  brand: string
  model: string
  serial_number: string
  id: number
  owner_type: string // e.g. 'SOLO_PILOT'
  organization_id?: number | null
  solo_owner_user_id: number
  current_status: string // e.g. 'IDLE'
  last_seen_at?: string | null
  created_at: string
  updated_at: string
}

export interface Waypoint {
  latitude: number
  longitude: number
  altitude_m: number
  sequence_order: number
  // id: number
  // flight_plan_id: number
}
export interface WaypointDto {
  latitude: number
  longitude: number
  altitude_m: number
  sequence_order: number
  id: number
  flight_plan_id: number
}

export interface CrateaWaypoint {
  latitude: number
  longitude: number
  altitude_m: number
  sequence_order: number
}

export interface SubmitterUserDto {
  email: string
  full_name: string
  phone_number: string
  iin: string
  id: number
  role: string // e.g. 'SOLO_PILOT'
  is_active: boolean
  organization_id?: number | null
  created_at: string
  updated_at: string
}

export const createFlightRequest = async (data: CreateFlightRequest) => {
  const res = await apiClient.post<FlightRequestDto>(`/flights`, data)
  return res.data
}
