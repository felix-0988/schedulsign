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
  test("GET /api/auth/clear-cookies returns 200", async ({ request }) => {
    const response = await request.get("/api/auth/clear-cookies")
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.ok).toBe(true)
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
  test("clicking Google button navigates to Cognito", async ({ page }) => {
    await page.goto("/login")

    // Click the Google button — signInWithRedirect navigates directly to Cognito
    await page.click("text=Continue with Google")

    // Should navigate away from login page (to Cognito authorize URL)
    await page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 10000 })

    const finalUrl = page.url()
    console.log(`  Final URL: ${finalUrl}`)

    // Should have reached Cognito or Google (not an error page)
    expect(
      finalUrl.includes("amazoncognito.com") || finalUrl.includes("accounts.google.com"),
      `Expected Cognito or Google URL, got: ${finalUrl}`
    ).toBe(true)
  })
})
