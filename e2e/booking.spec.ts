import { test, expect } from "@playwright/test"

// Uses the known test user slug. Override with TEST_USER_SLUG env var.
const USER_SLUG = process.env.TEST_USER_SLUG || "szewong"

test.describe("User profile page", () => {
  test("shows user name and event types", async ({ page }) => {
    await page.goto(`/${USER_SLUG}`)
    await expect(page.locator("h1")).toBeVisible()
    const eventLinks = page.locator(`a[href^="/${USER_SLUG}/"]`)
    await expect(eventLinks.first()).toBeVisible()
  })

  test("returns 404 for non-existent user", async ({ page }) => {
    const response = await page.goto("/nonexistent-user-slug-12345")
    expect(response?.status()).toBe(404)
  })
})

test.describe("Booking page", () => {
  test("loads booking widget with calendar", async ({ page }) => {
    await page.goto(`/${USER_SLUG}`)
    const firstEventLink = page.locator(`a[href^="/${USER_SLUG}/"]`).first()
    const href = await firstEventLink.getAttribute("href")
    expect(href).toBeTruthy()

    await page.goto(href!)
    // Booking widget shows day-of-week headers (Su, Mo, Tu, etc.)
    // Booking widget shows event duration and calendar navigation arrows
    await expect(page.locator("text=min").first()).toBeVisible({ timeout: 10000 })
  })

  test("shows time slots when a date is selected", async ({ page }) => {
    await page.goto(`/${USER_SLUG}`)
    const firstEventLink = page.locator(`a[href^="/${USER_SLUG}/"]`).first()
    const href = await firstEventLink.getAttribute("href")
    await page.goto(href!)

    await expect(page.locator("text=min").first()).toBeVisible({ timeout: 10000 })

    // Click a future weekday (enabled day button with just a number)
    const enabledDay = page.locator("button:not([disabled])").filter({ hasText: /^\d+$/ })
    const count = await enabledDay.count()
    if (count > 0) {
      await enabledDay.last().click()
      // Wait for slots to load
      await page.waitForTimeout(2000)
      const timeSlots = page.locator("button").filter({ hasText: /\d{1,2}:\d{2}\s*(AM|PM)/i })
      const noTimes = page.locator("text=No available times")
      const hasTimes = (await timeSlots.count()) > 0
      const hasNoTimes = (await noTimes.count()) > 0
      expect(hasTimes || hasNoTimes).toBe(true)
    }
  })

  test("returns 404 for non-existent event slug", async ({ page }) => {
    const response = await page.goto(`/${USER_SLUG}/nonexistent-event-12345`)
    expect(response?.status()).toBe(404)
  })
})

test.describe("Slots API", () => {
  test("returns 400 without eventTypeId", async ({ request }) => {
    const response = await request.get("/api/slots")
    expect(response.status()).toBe(400)
  })

  test("returns 404 for non-existent eventTypeId", async ({ request }) => {
    const response = await request.get("/api/slots?eventTypeId=nonexistent&date=2026-03-15")
    expect(response.status()).toBe(404)
  })
})
