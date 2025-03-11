import apiClient from '@/lib/apiClient'

interface UserProfile {
  name: string
  email: string
  avatar: string
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const response = await apiClient.get('/api/user/profile')
  return response.data
}
