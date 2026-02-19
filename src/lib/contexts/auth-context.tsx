"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { Hub } from "aws-amplify/utils"
import * as authService from "@/lib/auth-service"
import type { AuthUser } from "@/lib/auth-service"

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ isSignedIn: boolean; nextStep?: string }>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>
  confirmRegistration: (email: string, code: string) => Promise<boolean>
  resendCode: (email: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      // Try client-side Amplify first (works for email/password sign-in)
      const authenticated = await authService.isAuthenticated()
      if (authenticated) {
        const userInfo = await authService.getCurrentUserInfo()
        setUser(userInfo)
        return
      }
    } catch {
      // Client-side check failed, try server-side
    }

    // Fallback: check via server API (works for server-side OAuth with HttpOnly cookies)
    try {
      const res = await fetch("/api/user")
      if (res.ok) {
        const data = await res.json()
        if (data?.id) {
          setUser({
            userId: data.id,
            email: data.email,
            name: data.name || undefined,
            emailVerified: true,
          })
          return
        }
      }
    } catch {
      // Server check also failed
    }

    setUser(null)
  }, [])

  // Always clear loading state after refreshUser completes
  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [refreshUser])

  // Listen for OAuth redirect completion (email/password sign-in)
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", async ({ payload }) => {
      if (payload.event === "signInWithRedirect" || payload.event === "signedIn") {
        await refreshUser()
        // Redirect to dashboard if on a public/auth page
        const path = window.location.pathname
        if (path === "/" || path === "/login" || path === "/signup") {
          window.location.href = "/dashboard"
        }
      }
      if (payload.event === "signInWithRedirect_failure") {
        console.error("OAuth sign-in failed:", payload.data)
      }
    })
    return unsubscribe
  }, [refreshUser])

  // Fallback: if user is authenticated and on a public auth page, redirect
  useEffect(() => {
    if (!isLoading && user) {
      const path = window.location.pathname
      if (path === "/" || path === "/login" || path === "/signup") {
        window.location.href = "/dashboard"
      }
    }
  }, [isLoading, user])

  const login = async (email: string, password: string) => {
    const result = await authService.signIn(email, password)
    if (result.isSignedIn) {
      await refreshUser()
    }
    return {
      isSignedIn: result.isSignedIn,
      nextStep: result.nextStep?.signInStep,
    }
  }

  const loginWithGoogle = async () => {
    await authService.signInWithGoogle()
  }

  const register = async (email: string, password: string, name: string) => {
    const result = await authService.signUp(email, password, name)
    return {
      needsConfirmation: result.nextStep.signUpStep === "CONFIRM_SIGN_UP",
    }
  }

  const confirmRegistration = async (email: string, code: string) => {
    const result = await authService.confirmSignUp(email, code)
    return result.isSignUpComplete
  }

  const resendCode = async (email: string) => {
    await authService.resendVerificationCode(email)
  }

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email)
  }

  const confirmForgotPassword = async (email: string, code: string, newPassword: string) => {
    await authService.confirmForgotPassword(email, code, newPassword)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Client-side signOut may fail for server-side sessions
    }
    setUser(null)
    window.location.href = "/api/auth/sign-out"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        confirmRegistration,
        resendCode,
        forgotPassword,
        confirmForgotPassword,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
