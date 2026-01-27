from playwright.sync_api import sync_playwright

def verify_seo_visuals(page):
    print("Navigating to Paris page...")
    page.goto("http://localhost:3000/en/paris")

    # Wait for Wiki section
    page.wait_for_selector('h2:has-text("About Paris")')

    # Check for attribution link
    attribution = page.locator('a[href^="https://en.wikipedia.org/wiki/Paris"]')
    if attribution.is_visible():
        print("✅ Wikipedia Attribution Visible")
    else:
        print("❌ Wikipedia Attribution Missing")

    # Take screenshot of Wiki section
    page.screenshot(path="verification/seo_visuals.png", full_page=True)
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_seo_visuals(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
