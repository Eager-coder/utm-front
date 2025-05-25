// src/api/flight-requests/getAllFlights.ts
import apiClient from '../apiClient'

export interface Waypoint {
  latitude: number
  longitude: number
  altitude?: number
  timestamp?: string
}

export interface Drone {
  id: number
  brand: string
  model: string
  serial_number: string
  owner_type: 'SOLO_PILOT' | 'ORGANIZATION'
}

export interface FlightRequestDto {
  id: number
  drone_id: number
  user_id: number
  organization_id: number | null
  status: 'COMPLETED' | string
  planned_departure_time: string
  planned_arrival_time: string
  actual_departure_time: string | null
  actual_arrival_time: string | null
  notes?: string
  waypoints: Waypoint[]
  drone: Drone
  created_at: string
  updated_at: string
}

export const getAllFlights = async () => {
  const res = await apiClient.get<FlightRequestDto[]>('/flights/admin/all', {
    params: {
      status: 'COMPLETED',
    },
  })
  return res.data
}
