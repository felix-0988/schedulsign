"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>}>
      <SignUpForm />
    </Suspense>
  )
}

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, confirmRegistration, resendCode, login, loginWithGoogle } = useAuth()

  const [step, setStep] = useState<"signup" | "confirm">("signup")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmationCode, setConfirmationCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    const confirmParam = searchParams.get("confirm")
    if (emailParam) setEmail(emailParam)
    if (confirmParam === "true") setStep("confirm")
  }, [searchParams])

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await register(email, password, name)

      if (result.needsConfirmation) {
        setStep("confirm")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "UsernameExistsException") {
          setError("An account with this email already exists.")
        } else if (err.name === "InvalidPasswordException") {
          setError("Password must be at least 8 characters with uppercase, lowercase, and numbers.")
        } else {
          setError(err.message)
        }
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const isComplete = await confirmRegistration(email, confirmationCode)

      if (isComplete) {
        // Auto sign in after confirmation
        try {
          await login(email, password)
          router.push("/dashboard")
        } catch {
          // If auto sign-in fails (e.g., password not available), redirect to login
          router.push("/login")
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "CodeMismatchException") {
          setError("Invalid verification code. Please try again.")
        } else if (err.name === "ExpiredCodeException") {
          setError("Verification code has expired. Please request a new one.")
        } else {
          setError(err.message)
        }
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResendCode() {
    setError("")
    setResendDisabled(true)

    try {
      await resendCode(email)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }

    // Re-enable after 30 seconds
    setTimeout(() => setResendDisabled(false), 30000)
  }

  async function handleGoogleSignIn() {
    try {
      await loginWithGoogle()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  if (step === "confirm") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">
              Schedul<span className="text-gray-900">Sign</span>
            </h1>
            <p className="text-gray-600">Verify your email</p>
            <p className="text-sm text-gray-500 mt-1">
              We sent a verification code to <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification code
                </label>
                <input
                  id="code"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  required
                  autoComplete="one-time-code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest"
                  placeholder="Enter code"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Verifying..." : "Verify email"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              Didn&apos;t receive a code?{" "}
              <button
                onClick={handleResendCode}
                disabled={resendDisabled}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendDisabled ? "Code sent" : "Resend code"}
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">
            Schedul<span className="text-gray-900">Sign</span>
          </h1>
          <p className="text-gray-600">Create your account</p>
          <p className="text-sm text-gray-500 mt-1">Get started for free — no credit card needed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="At least 8 characters"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must include uppercase, lowercase, and numbers
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="my-4 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
