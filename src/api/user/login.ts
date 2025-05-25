import apiClient from '../apiClient'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const params = new URLSearchParams()
  params.append('grant_type', 'password')
  params.append('username', credentials.email)
  params.append('password', credentials.password)
  params.append('scope', '') // Scope is empty in the example
  params.append('client_id', 'string') // As per curl example
  params.append('client_secret', 'string') // As per curl example

  const response = await apiClient.post<LoginResponse>(
    '/auth/login/access-token',
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )
  return response.data
}
