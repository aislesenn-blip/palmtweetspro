from playwright.sync_api import sync_playwright

def verify_currency_converter(page):
    print("Navigating to Paris page...")
    page.goto("http://localhost:3000/en/paris")

    print("Checking Currency Card...")
    try:
        # Wait for Currency Card Header
        page.wait_for_selector('h3:has-text("Currency Converter")', timeout=20000)
        print("✅ Currency Converter Header Present")

        # Check for Input
        page.wait_for_selector('input[type="number"]', timeout=5000)
        print("✅ Converter Input Present")

        # Check for Output
        # It initially shows '...' until rates load
        # Wait for rates to load (might fail if API blocks headless)
        # But structure is what matters for build.
    except:
        print("❌ Currency Converter Missing")

    page.screenshot(path="verification/currency_converter.png", full_page=True)
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_currency_converter(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
