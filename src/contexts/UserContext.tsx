import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUser, type User } from '../api/user/getUser'

interface UserContextType {
  user: User | null
  isLoading: boolean
  error: Error | null
  refetchUser: () => void // useQuery's refetch doesn't return a promise directly in the same way
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: user,
    isLoading,
    error,
    refetch: refetchUser,
  } = useQuery<User | null, Error>({
    initialData: null,
    queryKey: ['user', 'me'], // Unique key for this query
    queryFn: async (): Promise<User | null> => {
      try {
        console.log('Fetching user data...') // Log before the fetch
        const userData = await getUser()
        console.log('User data fetched successfully:', userData) // Log successful fetch
        return userData
      } catch (error: any) {
        console.error('Error fetching user data:', error) // Log the error
        if (error.response && error.response.status === 403) {
          return null // Return null for 403 errors
        }
        // For other errors, re-throw them to be handled by useQuery's error state
        throw error
      }
    },

    retry: (failureCount, error: any) => {
      // Do not retry on 403 errors
      if (error.response && error.response.status === 403) {
        return false
      }
      // For other errors, retry once
      return failureCount < 1
    },
    refetchOnWindowFocus: true, // Enable refetch on window focus
    enabled: true, // Ensure the query runs automatically
  })

  // Note: No useEffect needed for initial fetch, useQuery handles it.

  return (
    <UserContext.Provider
      value={{ user, isLoading, error: error || null, refetchUser }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
