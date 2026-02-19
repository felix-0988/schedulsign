import { createAuthRouteHandlers } from "@/lib/amplify-server-utils"

export const { GET } = createAuthRouteHandlers({
  redirectOnSignInComplete: "/dashboard",
  redirectOnSignOutComplete: "/login",
})
