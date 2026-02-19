"use client"

import { Amplify } from "aws-amplify"
import amplifyConfig from "@/lib/amplify-config"
import { AuthProvider } from "@/lib/contexts/auth-context"

Amplify.configure(amplifyConfig, { ssr: true })

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
