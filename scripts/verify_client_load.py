from playwright.sync_api import sync_playwright

def verify_client_load(page):
    print("Navigating to Paris page...")
    page.goto("http://localhost:3000/en/paris")

    # Check for Skeletons initially (animate-pulse)
    # This might be too fast to catch in a script, but we can try.
    # skeletons = page.locator('.animate-pulse')
    # if skeletons.count() > 0:
    #     print("✅ Skeletons visible initially.")

    # Wait for Client Data Load (Weather Temp)
    # We expect a number followed by °C
    print("Waiting for client-side Weather data...")
    # Regex: digits + °C
    try:
        page.wait_for_selector('div:has-text("°C")', timeout=15000)
        print("✅ Weather Data Loaded.")
    except:
        print("❌ Weather Data Timeout.")

    # Wait for Client Data Load (Time)
    # We expect digits:digits
    print("Waiting for client-side Time data...")
    try:
        page.wait_for_selector('div.text-3xl.font-bold:has-text(":")', timeout=15000)
        print("✅ Time Data Loaded.")
    except:
        print("❌ Time Data Timeout.")

    # Screenshot
    page.screenshot(path="verification/client_load.png")
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_client_load(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
