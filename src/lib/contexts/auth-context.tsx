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
      const authenticated = await authService.isAuthenticated()
      if (authenticated) {
        const userInfo = await authService.getCurrentUserInfo()
        setUser(userInfo)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Listen for OAuth redirect completion (Google sign-in)
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", async ({ payload }) => {
      if (payload.event === "signInWithRedirect") {
        await refreshUser()
        window.location.href = "/dashboard"
      }
      if (payload.event === "signInWithRedirect_failure") {
        console.error("OAuth sign-in failed:", payload.data)
      }
    })
    return unsubscribe
  }, [refreshUser])

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
    await authService.logout()
    setUser(null)
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
