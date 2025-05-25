// src/api/getOrganizations.ts

import apiClient from '../apiClient'

/**
 * Organization object returned by the API
 */
// --- Interfaces ---
export interface Organization {
  id: number
  name: string
  email: string
  phone_number: string
  bin: string
  city: string
  company_address: string
  admin_id: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Fetches a paginated list of organizations
 *
 * @param skip  Number of records to skip (default: 0)
 * @param limit Maximum number of records to return (default: 100)
 * @returns Promise resolving to an array of Organization
 */
export async function getOrganizations(skip: number = 0, limit: number = 100) {
  const res = await apiClient.get<Organization[]>('/organizations/', {
    params: { skip, limit },
  })

  return res.data
}
