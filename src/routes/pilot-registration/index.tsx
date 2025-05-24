import { PilotRegistrationPage } from '@/components/pilot-registration/PilotRegistrationPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pilot-registration/')({
  component: PilotRegistrationPage,
})
