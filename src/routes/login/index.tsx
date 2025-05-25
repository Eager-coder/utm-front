import React, { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { login, type LoginCredentials } from '../../api/user/login' // Import new login function and types
import { useUser } from '../../contexts/UserContext' // Import useUser hook
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { refetchUser } = useUser() // Get refetchUser from context
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: login, // Use the new login function
    onSuccess: async (data) => {
      localStorage.setItem('access_token', data.access_token)
      await refetchUser() // Refetch user info to update context
      navigate({ to: '/' }) // Redirect to main page
    },
    onError: (error: Error) => {
      // TODO: Handle login error (e.g., display error message to user)
      console.error('Login failed:', error)
      alert(
        `Login failed: ${error.message || 'Please check your credentials and try again.'}`,
      )
    },
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const credentials: LoginCredentials = { email, password }
    mutation.mutate(credentials)
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">Sign in to UTM</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Logging in...' : 'Login'}
        </Button>
        <div className="flex flex-row justify-between mt-5 text-sm text-blue-700">
          <Link to="/org-registration">Register as Organization</Link>
          <Link to="/pilot-registration">Register as Individual Pilot</Link>
        </div>
      </form>
    </div>
  )
}
