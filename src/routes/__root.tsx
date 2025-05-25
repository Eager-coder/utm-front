import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'
import { useUser } from '../contexts/UserContext'

export const Route = createRootRoute({
  // NOTE: This beforeLoad is not strictly necessary for this particular setup with UserProvider handling initial load,
  // but it's a good pattern if you need to perform route-specific async operations or checks before rendering.
  // For this case, we'll keep it simple and rely on UserProvider's useEffect.
  // beforeLoad: async ({ context }) => {
  //   // Example: if you needed to ensure user is loaded for specific routes, you might do something here
  //   // if (!context.auth.user) {
  //   //   throw redirect({
  //   //     to: '/login',
  //   //   })
  //   // }
  // },

  component: () => {
    const { user, isLoading, error } = useUser()
    console.log('user', user, isLoading, error)
    if (isLoading && !user) {
      // Show loading only on initial load or if user is null
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          Loading application...
        </div>
      )
    }

    // The error state is now handled within UserContext for 403 errors.
    // For other errors, useQuery will still populate the 'error' variable,
    // but we are choosing not to display a blocking error message here
    // to keep the page accessible.
    // You might want to add a non-blocking error notification (e.g., a toast) here if desired.

    // Render header and outlet. If 'user' is undefined (e.g., due to a 403 or other handled error),
    // the application will proceed as if no user is logged in.
    return (
      <>
        <Header />

        <Outlet />
        {/* Render Devtools only when not loading or erroring to avoid clutter */}
        {!isLoading && !error && (
          <TanStackRouterDevtools position="bottom-right" />
        )}
      </>
    )
  },
})
