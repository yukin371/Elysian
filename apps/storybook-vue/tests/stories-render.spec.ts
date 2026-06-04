import { expect, test } from "@playwright/test"

const STORYBOOK_URL = process.env.STORYBOOK_URL || "http://localhost:6006"

// All showcase template stories that should render without errors
const STORIES = [
  // Anime templates
  "public-luxe-showcase-anime-hero-landing--hero-with-featured-content",
  "public-luxe-showcase-anime-hero-landing--minimal-hero-dark",
  "public-luxe-showcase-anime-hero-landing--design-tokens",
  "public-luxe-showcase-anime-community-forum--forum-with-threads",
  "public-luxe-showcase-anime-community-forum--forum-dark-mode",
  "public-luxe-showcase-anime-creator-dashboard--full-dashboard",
  "public-luxe-showcase-anime-event-campaign--campaign-with-countdown",
  "public-luxe-showcase-anime-event-campaign--event-dark-mode",
  "public-luxe-showcase-anime-content-gallery--gallery-with-filter",
  "public-luxe-showcase-anime-content-gallery--character-showcase-grid",
  "public-luxe-showcase-anime-work-detail--work-detail-with-metadata",
  "public-luxe-showcase-anime-work-detail--work-detail-dark-mode",
  "public-luxe-showcase-anime-settings-profile--settings-editor",
  "public-luxe-showcase-anime-settings-profile--settings-dark-mode",
  // Enterprise templates
  "public-luxe-showcase-enterprise-data-table--data-table-default",
  "public-luxe-showcase-enterprise-data-table--data-table-dark-mode",
  "public-luxe-showcase-enterprise-detail--detail-default",
  "public-luxe-showcase-enterprise-detail--detail-dark-mode",
  "public-luxe-showcase-enterprise-form-create--form-create-default",
  "public-luxe-showcase-enterprise-form-create--form-create-dark-mode",
  "public-luxe-showcase-enterprise-form-wizard--wizard-default",
  "public-luxe-showcase-enterprise-form-wizard--wizard-dark-mode",
  // Website templates
  "public-luxe-showcase-website-landing--landing-default",
  "public-luxe-showcase-website-landing--landing-dark-mode",
  "public-luxe-showcase-website-about--about-default",
  "public-luxe-showcase-website-about--about-dark-mode",
  "public-luxe-showcase-website-contact--contact-default",
  "public-luxe-showcase-website-contact--contact-dark-mode",
  "public-luxe-showcase-website-pricing--pricing-default",
  "public-luxe-showcase-website-pricing--pricing-dark-mode",
  // Website templates (new)
  "public-luxe-showcase-website-blog-list--blog-list-default",
  "public-luxe-showcase-website-blog-list--blog-list-dark-mode",
  "public-luxe-showcase-website-blog-detail--blog-detail-default",
  "public-luxe-showcase-website-blog-detail--blog-detail-dark-mode",
  "public-luxe-showcase-website-faq--faq-default",
  "public-luxe-showcase-website-faq--faq-dark-mode",
  "public-luxe-showcase-website-team--team-default",
  "public-luxe-showcase-website-team--team-dark-mode",
  "public-luxe-showcase-website-error-404--error-404-default",
  "public-luxe-showcase-website-error-404--error-404-dark-mode",
]

for (const storyId of STORIES) {
  const storyName = storyId.split("--").pop() ?? ""

  test(`${storyName} renders without errors`, async ({ page }) => {
    const url = `${STORYBOOK_URL}/iframe.html?viewMode=story&id=${storyId}`
    const consoleErrors: string[] = []

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto(url, { waitUntil: "load" })

    // Wait for Vue to mount — Storybook renders inside #storybook-root
    await page
      .locator("#storybook-root")
      .waitFor({ state: "attached", timeout: 20_000 })
    await page.waitForTimeout(2000)

    // Check for Storybook error boundary UI
    const rootText = await page.locator("#storybook-root").textContent()

    if (
      rootText?.includes("SyntaxError") ||
      rootText?.includes("failed to render") ||
      rootText?.includes("Unexpected identifier")
    ) {
      const m =
        rootText.match(/SyntaxError[^\n]{0,120}/) ||
        rootText.match(/Unexpected[^\n]{0,120}/)
      throw new Error(
        `Story render failed: ${m?.[0] ?? rootText.substring(0, 300)}`,
      )
    }

    // Check console for SyntaxError from template compilation
    const syntaxErrors = consoleErrors.filter(
      (e) => e.includes("SyntaxError") || e.includes("Unexpected"),
    )
    expect(
      syntaxErrors,
      `Template compilation errors: ${syntaxErrors.join("; ")}`,
    ).toHaveLength(0)

    // Verify the story actually rendered content
    expect(
      rootText?.trim().length,
      "Story rendered empty content",
    ).toBeGreaterThan(50)
  })
}
