// src/api/getOrganizations.ts

import apiClient from '../apiClient'

/**
 * Organization object returned by the API
 */
export interface Organization {
  id: number
  name: string
  bin: string
  company_address: string
  city: string
  is_active: boolean
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
