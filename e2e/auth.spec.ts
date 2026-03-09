import { test, expect } from "@playwright/test"

test.describe("Public pages", () => {
  test("landing page loads", async ({ page }) => {
    const response = await page.goto("/")
    expect(response?.status()).toBe(200)
  })

  test("login page loads with Google sign-in button", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("text=Continue with Google")).toBeVisible()
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

  test("dashboard/bookings redirects to login", async ({ page }) => {
    await page.goto("/dashboard/bookings")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
  })
})

test.describe("Protected API routes return 401", () => {
  for (const endpoint of ["/api/event-types", "/api/bookings", "/api/user", "/api/contacts"]) {
    test(`GET ${endpoint} returns 401`, async ({ request }) => {
      const response = await request.get(endpoint)
      expect(response.status()).toBe(401)
    })
  }
})

test.describe("Public API routes accessible without auth", () => {
  test("GET /api/slots returns 400 (missing params, not 401)", async ({ request }) => {
    const response = await request.get("/api/slots")
    // Should be 400 (missing eventTypeId), not 401
    expect(response.status()).toBe(400)
  })

  test("POST /api/bookings returns non-401", async ({ request }) => {
    const response = await request.post("/api/bookings", {
      data: {},
    })
    // Should be 400 or 500 (bad request), not 401
    expect(response.status()).not.toBe(401)
  })
})

test.describe("Google OAuth flow", () => {
  test("clicking Google button redirects to Auth.js then Google", async ({ page }) => {
    await page.goto("/login")
    await page.click("text=Continue with Google")
    await page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 10000 })
    const finalUrl = page.url()
    expect(
      finalUrl.includes("accounts.google.com") || finalUrl.includes("/api/auth/"),
    ).toBe(true)
  })
})
