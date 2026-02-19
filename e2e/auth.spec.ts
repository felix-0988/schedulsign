import { test, expect } from "@playwright/test"

test.describe("Public pages", () => {
  test("landing page loads", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
    await expect(page.getByRole("link", { name: /SchedulSign/ }).first()).toBeVisible()
  })

  test("login page loads", async ({ page }) => {
    const response = await page.goto("/login")
    expect(response?.status()).toBe(200)
    await expect(page.locator("text=Welcome back")).toBeVisible()
    await expect(page.locator("text=Continue with Google")).toBeVisible()
  })

  test("signup page loads", async ({ page }) => {
    const response = await page.goto("/signup")
    expect(response?.status()).toBe(200)
    await expect(page.locator("text=Create your account")).toBeVisible()
  })

  test("forgot-password page loads", async ({ page }) => {
    const response = await page.goto("/forgot-password")
    expect(response?.status()).toBe(200)
  })
})

test.describe("Auth middleware - protected pages redirect to login", () => {
  test("dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
  })

  test("dashboard/settings redirects to login", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
  })
})

test.describe("Auth API routes", () => {
  test("GET /api/auth/sign-in?provider=Google redirects to Cognito (not 500)", async ({ request }) => {
    const response = await request.get("/api/auth/sign-in?provider=Google", {
      maxRedirects: 0,
    })
    const status = response.status()
    console.log(`  Status: ${status}`)
    console.log(`  Location: ${response.headers()["location"] || "none"}`)

    if (status >= 400) {
      const body = await response.text()
      console.log(`  Error body: ${body.substring(0, 500)}`)
    }

    // Should be a redirect to Cognito, NOT a 500
    expect(status, "Should redirect to Cognito, not return error").toBeLessThan(400)
  })

  test("GET /api/event-types returns 401 when not authenticated", async ({ request }) => {
    const response = await request.get("/api/event-types")
    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Unauthorized")
  })

  test("GET /api/bookings returns 401 when not authenticated", async ({ request }) => {
    const response = await request.get("/api/bookings")
    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Unauthorized")
  })

  test("GET /api/user returns 401 when not authenticated", async ({ request }) => {
    const response = await request.get("/api/user")
    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Unauthorized")
  })
})

test.describe("Google OAuth flow - redirect chain", () => {
  test("clicking Google button navigates to auth endpoint", async ({ page }) => {
    await page.goto("/login")

    // Click the Google button and wait for navigation
    await page.click("text=Continue with Google")

    // Should navigate away from login page (to /api/auth/sign-in then to Cognito)
    await page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 10000 })

    const finalUrl = page.url()
    console.log(`  Final URL: ${finalUrl}`)

    // Should have reached Cognito or Google (not our error page)
    expect(finalUrl).not.toContain("/api/auth/sign-in")
    expect(
      finalUrl.includes("amazoncognito.com") || finalUrl.includes("accounts.google.com"),
      `Expected Cognito or Google URL, got: ${finalUrl}`
    ).toBe(true)
  })
})
