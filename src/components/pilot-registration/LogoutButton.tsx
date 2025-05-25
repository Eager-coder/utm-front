import { Button } from '../ui/button'

export function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    window.location.replace('/login')
  }

  return (
    <Button variant={'destructive'} onClick={handleLogout}>
      Logout
    </Button>
  )
}
