import { useNavigate } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export function PilotRegistrationSuccessPage() {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col items-center pt-8">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <CardTitle className="mt-4 text-2xl">
            Registration Successful!
          </CardTitle>
          <CardDescription className="text-center mt-2 text-gray-600">
            Thank you for signing up as a pilot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-8">
          <p>
            • Please check your email for a confirmation link.
            <br />• We’ll review your application and get back to you within 2–3
            business days.
          </p>
          <Button
            variant="default"
            className="w-full"
            onClick={() => navigate({ to: '/' })}
          >
            Go to Home
          </Button>
          <Button variant="outline" className="w-full">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
