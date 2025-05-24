import apiClient from '../apiClient'

export interface User {
  id: number
  email: string
  full_name: string
  phone_number: string
  iin: string
  role: 'SOLO_PILOT' | 'ORGANIZATION_PILOT'
  organization_id: number | null
  is_active: boolean
}

export async function getUser(): Promise<User> {
  return (
    await apiClient.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
  ).data
}
