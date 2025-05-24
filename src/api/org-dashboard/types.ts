export type DroneStatus = 'IDLE' | 'ACTIVE' | 'MAINTENANCE' | 'UNKNOWN'

export interface Drone {
  id: string
  brand: string
  model: string
  serial_number: string
  current_status: DroneStatus
}

export interface User {
  id: string
  full_name: string
  email: string
  role: 'ORGANIZATION_ADMIN' | 'ORGANIZATION_PILOT'
}

export interface PilotWithDrone extends User {
  assigned_drone?: Drone | null
}
