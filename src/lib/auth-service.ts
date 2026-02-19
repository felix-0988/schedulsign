/**
 * Client-side auth service wrapping AWS Amplify v6 auth functions.
 * Provides a clean API for all authentication operations.
 *
 * NOTE: This is for client-side use only. For server-side auth
 * (API routes, middleware), use src/lib/auth.ts instead.
 */
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  resendSignUpCode as amplifyResendSignUpCode,
  signInWithRedirect as amplifySignInWithRedirect,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  type SignInInput,
  type SignUpInput,
} from "aws-amplify/auth"

export interface AuthUser {
  userId: string
  email: string
  name?: string
  emailVerified: boolean
}

export async function signIn(email: string, password: string) {
  const input: SignInInput = { username: email, password }
  return amplifySignIn(input)
}

export async function signUp(email: string, password: string, name: string) {
  const input: SignUpInput = {
    username: email,
    password,
    options: {
      userAttributes: { email, name },
    },
  }
  return amplifySignUp(input)
}

export async function confirmSignUp(email: string, code: string) {
  return amplifyConfirmSignUp({ username: email, confirmationCode: code })
}

export async function resendVerificationCode(email: string) {
  return amplifyResendSignUpCode({ username: email })
}

export function clearStaleAuthData() {
  // Clear non-HttpOnly Cognito cookies
  document.cookie.split(";").forEach((c) => {
    const name = c.trim().split("=")[0]
    if (
      name.startsWith("CognitoIdentityServiceProvider.") ||
      name.startsWith("com.amplify.server_auth.")
    ) {
      document.cookie = `${name}=; Max-Age=0; path=/`
    }
  })
  // Clear stale Cognito data from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith("CognitoIdentityServiceProvider.") ||
      key.startsWith("amplify-")
    ) {
      localStorage.removeItem(key)
    }
  })
}

export async function signInWithGoogle() {
  clearStaleAuthData()
  await amplifySignInWithRedirect({ provider: "Google" })
}

export async function logout() {
  return amplifySignOut()
}

export async function forgotPassword(email: string) {
  return amplifyResetPassword({ username: email })
}

export async function confirmForgotPassword(email: string, code: string, newPassword: string) {
  return amplifyConfirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword,
  })
}

export async function getSession() {
  return fetchAuthSession()
}

export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() ?? null
  } catch {
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser()
    return true
  } catch {
    return false
  }
}

export async function getCurrentUserInfo(): Promise<AuthUser | null> {
  try {
    const user = await getCurrentUser()
    const attrs = await fetchUserAttributes()
    return {
      userId: user.userId,
      email: attrs.email || "",
      name: attrs.name || undefined,
      emailVerified: attrs.email_verified === "true",
    }
  } catch {
    return null
  }
}
