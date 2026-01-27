from playwright.sync_api import sync_playwright

def verify_data_engine(page):
    print("Navigating to Paris page...")
    page.goto("http://localhost:3000/en/paris")

    # 1. Check for Skeletons (Initially loading)
    # This is hard to catch, but we can verify that we eventually get data.

    # 2. Check for Weather Data (via Dashboard -> WeatherCard)
    print("Waiting for Weather Data...")
    page.wait_for_selector('div:has-text("°C")', timeout=20000)
    print("✅ Weather Card Loaded")

    # 3. Check for Identity/Currency (via Dashboard -> Identity/Currency)
    # Currency usually has a 3-letter code (EUR)
    print("Waiting for Currency Data...")
    try:
        page.wait_for_selector('h3:has-text("Currency")', timeout=20000)
        # Check for content (not skeleton)
        # Skeleton has 'animate-pulse'. Real content does not.
        # Check text in the card.
        # "Currency" card body should contain "EUR" or "Euro"
        page.wait_for_selector('div:has-text("EUR")', timeout=20000)
        print("✅ Currency Data Loaded")
    except:
        print("❌ Currency Data Missing")

    # 4. Check Quick Insights Summary
    print("Waiting for Quick Insights...")
    try:
        page.wait_for_selector('div:has-text("Quick Insights")', timeout=10000)
        # Check text content: "Paris is a..."
        page.wait_for_selector('p:has-text("Paris is a")', timeout=10000)
        print("✅ Quick Insights Text Generated")
    except:
        print("❌ Quick Insights Missing")

    page.screenshot(path="verification/data_engine.png", full_page=True)
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_data_engine(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
