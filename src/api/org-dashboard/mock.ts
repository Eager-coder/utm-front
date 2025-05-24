import type { PilotWithDrone, Drone } from './types'

// Mock: All org pilots and their assigned drones
export const mockPilots: PilotWithDrone[] = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john@example.com',
    role: 'ORGANIZATION_PILOT',
    assigned_drone: {
      id: 'dr-1',
      brand: 'DJI',
      model: 'Phantom 4',
      serial_number: 'SN-PH4-001',
      current_status: 'IDLE',
    },
  },
  {
    id: '2',
    full_name: 'Aliya Bakyt',
    email: 'aliya@sky.kz',
    role: 'ORGANIZATION_PILOT',
    assigned_drone: null,
  },
]

// Mock: Drones in the org available for assignment
export const mockAvailableDrones: Drone[] = [
  {
    id: 'dr-2',
    brand: 'Autel',
    model: 'Evo II',
    serial_number: 'SN-AE2-042',
    current_status: 'IDLE',
  },
  {
    id: 'dr-3',
    brand: 'DJI',
    model: 'Mavic Air 2',
    serial_number: 'SN-MA2-503',
    current_status: 'MAINTENANCE',
  },
]

// 🚧 TODO: Replace these with API calls later
// e.g., GET /api/v1/organizations/{org_id}/users, GET /drones/my
