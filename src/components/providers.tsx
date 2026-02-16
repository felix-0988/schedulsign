"use client"

import { Amplify } from "aws-amplify"
import amplifyConfig from "@/lib/amplify-config"

Amplify.configure(amplifyConfig, { ssr: true })

export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
