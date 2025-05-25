// src/api/getOrganizations.ts

import apiClient from '../apiClient'
import type { Role } from '../user/getUser'

export type DroneStatus = 'IDLE' | 'ACTIVE' | 'MAINTENANCE' | 'UNKNOWN'

export interface Drone {
  brand: string
  model: string
  serial_number: string
  id: number
  owner_type: Role
  organization_id: number | null
  solo_owner_user_id: number
  current_status: DroneStatus
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export async function createDrone(body: {
  brand: string
  model: string
  serial_number: string
  organization_id?: number
}) {
  const res = await apiClient.post<Drone>('/drones/', body)

  return res.data
}
