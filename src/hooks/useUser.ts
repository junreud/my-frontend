import { useQuery } from "@tanstack/react-query"

interface User {
  name: string
  email: string
  avatar?: string
  url_registration?: number
}

export function useUser() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user/me", { credentials: "include" })
      if (!res.ok) {
        throw new Error("Not authenticated")
      }
      return res.json() as Promise<User>
    },
    // (A) staleTime, refetchOnWindowFocus 같은 옵션은 queryFn 바깥
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
  })
}
