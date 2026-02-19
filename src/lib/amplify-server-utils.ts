import { createServerRunner } from "@aws-amplify/adapter-nextjs"
import amplifyConfig from "./amplify-config"

export const { runWithAmplifyServerContext, createAuthRouteHandlers } = createServerRunner({
  config: amplifyConfig,
})
