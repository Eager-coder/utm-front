import { PilotRegistrationSuccessPage } from '@/components/pilot-registration/PilotRegistrationSuccessPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pilot-registration/success')({
  component: PilotRegistrationSuccessPage,
})
