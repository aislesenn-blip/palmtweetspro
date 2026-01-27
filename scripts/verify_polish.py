from playwright.sync_api import sync_playwright

def verify_polish(page):
    print("Navigating to Paris page...")
    page.goto("http://localhost:3000/en/paris")

    # 1. Hero Image
    print("Checking Hero Image...")
    # It might be a div or img. The code uses <img> if loaded, div if fallback.
    # Class includes 'object-cover'.
    try:
        # Wait a bit for Unsplash
        page.wait_for_selector('img.object-cover', timeout=10000)
        print("✅ Hero Image Loaded (Unsplash)")
    except:
        print("⚠️ Hero Image Fallback (Gradient) Active (or Unsplash rate limited)")

    # 2. Map (Leaflet)
    print("Checking Map...")
    try:
        page.wait_for_selector('.leaflet-container', timeout=10000)
        print("✅ Leaflet Map Loaded")
    except:
        print("❌ Leaflet Map Missing")

    # 3. Identity Flags
    print("Checking Flags...")
    try:
        page.wait_for_selector('img[alt$="flag"]', timeout=10000)
        print("✅ Country Flag Loaded")
    except:
        print("❌ Country Flag Missing")

    # 4. Logistics Postal Code
    print("Checking Postal Code...")
    try:
        page.wait_for_selector('span:has-text("Postal Code:")', timeout=10000)
        print("✅ Postal Code UI Present")
    except:
        print("❌ Postal Code UI Missing")

    page.screenshot(path="verification/final_polish.png", full_page=True)
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_polish(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
