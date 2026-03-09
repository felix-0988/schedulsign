import { test, expect } from "@playwright/test"

test.describe("Cancel page", () => {
  test("shows cancel form for valid booking uid", async ({ page }) => {
    // Use a fake UID — should show 404 or error, not crash
    await page.goto("/cancel/nonexistent-uid-12345")
    // The cancel page renders client-side and tries to cancel on submit
    // With a bad UID it should still render the form
    await expect(page.getByRole("heading", { name: "Cancel Booking" })).toBeVisible()
  })

  test("cancel API returns 404 for non-existent booking", async ({ request }) => {
    const response = await request.post("/api/bookings/nonexistent-uid/cancel", {
      data: { reason: "test" },
    })
    expect(response.status()).toBe(404)
  })
})

test.describe("Reschedule page", () => {
  test("shows reschedule form", async ({ page }) => {
    await page.goto("/reschedule/nonexistent-uid-12345")
    await expect(page.locator("text=Reschedule Booking")).toBeVisible()
  })

  test("reschedule API returns 404 for non-existent booking", async ({ request }) => {
    const response = await request.post("/api/bookings/nonexistent-uid/reschedule", {
      data: { newStartTime: new Date().toISOString() },
    })
    expect(response.status()).toBe(404)
  })
})

test.describe("Booking info API", () => {
  test("GET /api/bookings/:uid returns 404 for non-existent uid", async ({ request }) => {
    const response = await request.get("/api/bookings/nonexistent-uid-12345")
    expect(response.status()).toBe(404)
  })
})
