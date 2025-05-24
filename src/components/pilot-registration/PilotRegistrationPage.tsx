// src/routes/PilotRegistrationPage.tsx
import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

type Organization = {
  id: string
  name: string
}

type FormData = {
  fullName: string
  email: string
  phone: string
  independent: boolean
  orgMember: boolean
  orgId?: string
  orgDetails?: string
}

async function fetchOrgs(): Promise<Organization[]> {
  const res = await fetch('/api/organizations')
  if (!res.ok) throw new Error('Failed to load organizations')
  return res.json()
}

async function submitRegistration(data: FormData) {
  const res = await fetch('/api/pilot-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Registration failed')
  return res.json()
}

export function PilotRegistrationPage() {
  const navigate = useNavigate()

  // ← useQuery with single options object
  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['orgs'],
    queryFn: fetchOrgs,
  })

  // ← useMutation with single options object
  const mutation = useMutation({
    mutationFn: submitRegistration,
    onSuccess: () => {
      navigate({ to: '/pilot-registration/success' })
    },
  })

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [independent, setIndependent] = useState(false)
  const [orgMember, setOrgMember] = useState(false)
  const [orgId, setOrgId] = useState<string | undefined>(undefined)
  const [orgDetails, setOrgDetails] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      fullName,
      email,
      phone,
      independent,
      orgMember,
      orgId,
      orgDetails,
    })
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold">Pilot Registration</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="space-y-2">
          <div className="flex items-center">
            <Checkbox
              id="independent"
              checked={independent}
              onCheckedChange={(checked) => setIndependent(!!checked)}
            />
            <label htmlFor="independent" className="ml-2">
              Independent pilot
            </label>
          </div>

          <div className="flex items-center">
            <Checkbox
              id="orgMember"
              checked={orgMember}
              onCheckedChange={(checked) => {
                setOrgMember(!!checked)
                if (!checked) {
                  setOrgId(undefined)
                  setOrgDetails('')
                }
              }}
            />
            <label htmlFor="orgMember" className="ml-2">
              Organization member (select below)
            </label>
          </div>
        </div>

        {orgMember && (
          <div className="space-y-3">
            <Select
              onValueChange={setOrgId}
              value={orgId}
              disabled={orgsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select org" />
              </SelectTrigger>
              <SelectContent>
                {orgs.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Organization details..."
              value={orgDetails}
              onChange={(e) => setOrgDetails(e.target.value)}
              rows={4}
            />
          </div>
        )}

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Submitting…' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}
