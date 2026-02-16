import { type ResourcesConfig } from "aws-amplify"

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
          redirectSignOut: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
          responseType: "code",
        },
      },
    },
  },
}

export default amplifyConfig
