// src/routes/organization-registration.page.tsx
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
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
import apiClient from '@/api/apiClient'

// ────────────────────────────────────────────────────────────────────────────────
// 1️⃣  Schema & Type -----------------------------------------------------------------
const registrationSchema = z.object({
  org_name: z.string().min(2, 'Required'),
  bin: z.string().length(12, 'BIN must be 12 digits'),
  company_address: z.string().min(2, 'Required'),
  city: z.string().min(2, 'Required'),
  admin_full_name: z.string().min(2, 'Required'),
  admin_email: z.string().email('Invalid e-mail'),
  admin_password: z.string().min(6, 'Password must be at least 6 characters'),
  admin_phone_number: z.string().min(5, 'Required'),
  admin_iin: z.string().min(1, 'Required'),
})

type RegistrationValues = z.infer<typeof registrationSchema>

// ────────────────────────────────────────────────────────────────────────────────
// 2️⃣  API helper -------------------------------------------------------------------
async function registerOrganization(data: RegistrationValues) {
  const res = await apiClient.post('/auth/register/organization-admin', data)
  return res.data
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
      org_name: '',
      bin: '',
      company_address: '',
      city: '',
      admin_full_name: '',
      admin_email: '',
      admin_password: '',
      admin_phone_number: '',
      admin_iin: '',
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
          <h1 className="text-2xl font-semibold">Organization Registration</h1>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {/* Organization Name */}
              <FormField
                control={form.control}
                name="org_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
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

              {/* Company Address */}
              <FormField
                control={form.control}
                name="company_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St." {...field} />
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

              {/* Admin Full Name */}
              <FormField
                control={form.control}
                name="admin_full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admin Email */}
              <FormField
                control={form.control}
                name="admin_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@org.kz"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admin Password */}
              <FormField
                control={form.control}
                name="admin_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admin Phone Number */}
              <FormField
                control={form.control}
                name="admin_phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+7 701 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admin IIN */}
              <FormField
                control={form.control}
                name="admin_iin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin IIN</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789012" {...field} />
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
          <Link
            className="block mt-4  text-center text-blue-700 mx-auto w-full"
            to="/pilot-registration"
          >
            Register as Individual Pilot
          </Link>{' '}
          <Link
            className="block mt-2  text-center text-blue-700 mx-auto w-full"
            to="/login"
          >
            Login
          </Link>
        </CardContent>
      </Card>{' '}
    </div>
  )
}
