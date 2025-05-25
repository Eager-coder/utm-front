import apiClient from '../apiClient'

export interface SoloPilot {
  id: number
  full_name: string
  email: string
  phone_number: string
  iin: string
  role: 'SOLO_PILOT'
  is_active: boolean
  organization_id: number
  created_at: string
  updated_at: string
}

export const getSoloPilots = async () => {
  const res = await apiClient.get<SoloPilot[]>('/users/?role=SOLO_PILOT')
  return res.data
}
