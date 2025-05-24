// src/routes/organization-registration/success.tsx
// import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle } from 'lucide-react'

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ────────────────────────────────────────────────────────────────────────────────
// Route definition ----------------------------------------------------------------
export const Route = createFileRoute('/org-registration/success')({
  component: SuccessPage,
})

// ────────────────────────────────────────────────────────────────────────────────
// Component -----------------------------------------------------------------------
function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-12 w-12 stroke-[1.5]" />
            <h1 className="text-2xl font-semibold">Registration complete!</h1>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground">
            Your organization has been successfully registered. You can now
            access your dashboard or return to the homepage.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" asChild>
            <Link to="/">Go home</Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard">Open dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
