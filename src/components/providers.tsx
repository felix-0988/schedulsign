"use client"

import { Amplify } from "aws-amplify"
import amplifyConfig from "@/lib/amplify-config"
import { AuthProvider } from "@/lib/contexts/auth-context"

// On OAuth callback, clear stale localStorage auth data before SDK initializes.
// PKCE state is in cookies (ssr: true), so this won't affect the code exchange.
if (typeof window !== "undefined" && window.location.search.includes("code=")) {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("CognitoIdentityServiceProvider.")) {
      localStorage.removeItem(key)
    }
  })
}

Amplify.configure(amplifyConfig, { ssr: true })

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
