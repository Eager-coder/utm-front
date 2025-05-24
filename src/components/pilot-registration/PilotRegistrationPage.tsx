// src/routes/PilotRegistrationPage.tsx
import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/api/apiClient'
import {
  getOrganizations,
  type Organization,
} from '@/api/organizations/getOrganizations'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Form payload shapes matching API
interface SoloPayload {
  full_name: string
  email: string
  password: string
  phone_number: string
  iin: string
}

interface OrgPayload extends SoloPayload {
  organization_id: number
}

export function PilotRegistrationPage() {
  const navigate = useNavigate()

  // form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [iin, setIin] = useState('')
  const [independent, setIndependent] = useState(false)
  const [orgMember, setOrgMember] = useState(false)
  const [orgId, setOrgId] = useState<number | null>(null)

  // fetch organization list
  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => getOrganizations(),
  })

  // mutation for solo pilot
  const soloMutation = useMutation({
    mutationFn: (payload: SoloPayload) =>
      apiClient.post('/auth/register/solo-pilot', payload),
    onSuccess: () => {
      toast.success('Solo pilot registered!')
      navigate({ to: '/pilot-registration/success' })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          (error instanceof Error ? error.message : 'Registration failed'),
      )
    },
  })

  // mutation for organization pilot
  const orgMutation = useMutation({
    mutationFn: (payload: OrgPayload) =>
      apiClient.post('/auth/register/organization-pilot', payload),
    onSuccess: () => {
      toast.success('Organization pilot registered!')
      navigate({ to: '/pilot-registration/success' })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          (error instanceof Error ? error.message : 'Registration failed'),
      )
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const base = {
      full_name: fullName,
      email,
      password,
      phone_number: phone,
      iin,
    }

    if (independent) {
      soloMutation.mutate(base)
    } else if (orgMember && orgId !== null) {
      orgMutation.mutate({ ...(base as SoloPayload), organization_id: orgId })
    } else {
      toast.error(
        'Please select either Independent or Organization member and fill required fields.',
      )
    }
  }

  const isSubmitting = soloMutation.isPending || orgMutation.isPending

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold">Pilot Registration</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <Input
          placeholder="IIN"
          value={iin}
          onChange={(e) => setIin(e.target.value)}
          required
        />

        <div className="space-y-2">
          <label className="flex items-center">
            <Checkbox
              checked={independent}
              onCheckedChange={(c) => {
                setIndependent(!!c)
                if (c) setOrgMember(false)
              }}
            />
            <span className="ml-2">Independent pilot</span>
          </label>

          <label className="flex items-center">
            <Checkbox
              checked={orgMember}
              onCheckedChange={(c) => {
                setOrgMember(!!c)
                if (c) setIndependent(false)
                if (!c) setOrgId(null)
              }}
            />
            <span className="ml-2">Organization member</span>
          </label>
        </div>

        {orgMember && (
          <Select
            onValueChange={(val) => setOrgId(Number(val))}
            value={orgId?.toString()}
            disabled={orgsLoading}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {orgs.map((org: Organization) => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}
