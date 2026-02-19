import { createAuthRouteHandlers } from "@/lib/amplify-server-utils"

// AMPLIFY_APP_ORIGIN is required by createAuthRouteHandlers but Amplify Hosting
// only passes NEXT_PUBLIC_* env vars to the SSR compute runtime. Set it from
// NEXT_PUBLIC_APP_URL which IS available at runtime.
if (!process.env.AMPLIFY_APP_ORIGIN && process.env.NEXT_PUBLIC_APP_URL) {
  process.env.AMPLIFY_APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL
}

export const GET = createAuthRouteHandlers({
  redirectOnSignInComplete: "/dashboard",
  redirectOnSignOutComplete: "/login",
})
