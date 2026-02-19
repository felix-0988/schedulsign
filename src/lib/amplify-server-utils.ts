import { createServerRunner } from "@aws-amplify/adapter-nextjs"
import amplifyConfig from "./amplify-config"

// AMPLIFY_APP_ORIGIN is required by createAuthRouteHandlers but Amplify Hosting
// only passes NEXT_PUBLIC_* env vars to the SSR compute runtime. Set it from
// NEXT_PUBLIC_APP_URL BEFORE createServerRunner captures it in a closure.
if (!process.env.AMPLIFY_APP_ORIGIN && process.env.NEXT_PUBLIC_APP_URL) {
  process.env.AMPLIFY_APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL
}

export const { runWithAmplifyServerContext, createAuthRouteHandlers } = createServerRunner({
  config: amplifyConfig,
})
