"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { resetPassword, confirmResetPassword } from "aws-amplify/auth"

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [step, setStep] = useState<"request" | "confirm">("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await resetPassword({ username: email })

      if (result.nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        setStep("confirm")
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "UserNotFoundException") {
          // Don't reveal if user exists - show same success message
          setStep("confirm")
        } else if (err.name === "LimitExceededException") {
          setError("Too many attempts. Please try again later.")
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

  async function handleConfirmReset(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      })

      router.push("/login")
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "CodeMismatchException") {
          setError("Invalid verification code. Please try again.")
        } else if (err.name === "ExpiredCodeException") {
          setError("Verification code has expired. Please request a new one.")
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

  if (step === "confirm") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">
              Schedul<span className="text-gray-900">Sign</span>
            </h1>
            <p className="text-gray-600">Reset your password</p>
            <p className="text-sm text-gray-500 mt-1">
              Enter the code sent to <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoComplete="one-time-code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest"
                  placeholder="Enter code"
                  maxLength={6}
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              <button
                onClick={() => { setStep("request"); setError("") }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Try a different email
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
          <p className="text-gray-600">Forgot your password?</p>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email and we&apos;ll send you a reset code
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleRequestReset} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Sending code..." : "Send reset code"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
