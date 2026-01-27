from playwright.sync_api import sync_playwright

def verify_expansion_final(page):
    print("Navigating to Paris page...")
    page.goto("http://localhost:3000/en/paris")

    # 1. Travel Card
    print("Checking Travel Card...")
    try:
        page.wait_for_selector('h3:has-text("Travel & Distance")', timeout=20000)
        # Check for Airport
        page.wait_for_selector('li:has-text("km")', timeout=10000)
        print("✅ Travel Card Verified (with Airports)")
    except:
        print("❌ Travel Card Missing or Airports not loaded")

    # 2. Astronomy Card
    print("Checking Astronomy Card...")
    try:
        page.wait_for_selector('h3:has-text("Astronomy")', timeout=10000)
        # Check for Moon Phase
        page.wait_for_selector('p:has-text("Moon Phase")', timeout=10000)
        print("✅ Astronomy Card Verified")
    except:
        print("❌ Astronomy Card Missing")

    # 3. Government Card
    print("Checking Government Card...")
    try:
        page.wait_for_selector('h3:has-text("Government & Legal")', timeout=10000)
        page.wait_for_selector('span:has-text("112")', timeout=10000)
        print("✅ Government Card Verified")
    except:
        print("❌ Government Card Missing")

    page.screenshot(path="verification/expansion_final.png", full_page=True)
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_expansion_final(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
