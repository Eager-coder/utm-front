// src/routes/organization-registration.page.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'

// ────────────────────────────────────────────────────────────────────────────────
// 1️⃣  Schema & Type -----------------------------------------------------------------
const registrationSchema = z.object({
  fullName: z.string().min(2, 'Required'),
  email: z.string().email('Invalid e-mail'),
  organizationName: z.string().min(2, 'Required'),
  bin: z.string().length(12, 'BIN must be 12 digits'),
  city: z.string().min(2, 'Required'),
  postAddress: z.string().min(2, 'Required'),
})

type RegistrationValues = z.infer<typeof registrationSchema>

// ────────────────────────────────────────────────────────────────────────────────
// 2️⃣  API helper -------------------------------------------------------------------
async function registerOrganization(data: RegistrationValues) {
  const res = await fetch('/api/organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.message ?? 'Unexpected error')
  }

  return res.json()
}

// ────────────────────────────────────────────────────────────────────────────────
// 3️⃣  Route component --------------------------------------------------------------
export const Route = createFileRoute('/org-registration/')({
  component: OrganizationRegistrationPage,
})

function OrganizationRegistrationPage() {
  const navigate = useNavigate()

  // ── react-hook-form + zod
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      organizationName: '',
      bin: '',
      city: '',
      postAddress: '',
    },
  })

  // ── tanstack query mutation
  const { mutate, isPending } = useMutation({
    mutationFn: registerOrganization,
    onSuccess: () => {
      toast.success('Organization registered!')
      navigate({ to: '/org-registration/success' })
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Registration failed')
    },
  })

  function onSubmit(values: RegistrationValues) {
    mutate(values)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Organization registration</h1>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {/* Full name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@org.kz"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organization name */}
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* BIN */}
              <FormField
                control={form.control}
                name="bin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BIN</FormLabel>
                    <FormControl>
                      <Input placeholder="XXXXXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Astana" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Post address */}
              <FormField
                control={form.control}
                name="postAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post address</FormLabel>
                    <FormControl>
                      <Input placeholder="Kabanbay Batyr 5/3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isPending || !form.formState.isDirty}
              >
                {isPending ? 'Submitting…' : 'Submit'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
