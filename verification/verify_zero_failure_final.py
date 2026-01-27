from playwright.sync_api import sync_playwright

def verify_zero_failure_final(page):
    # 1. Check Homepage
    print("Navigating to Homepage...")
    page.goto("http://localhost:3000/en")

    # Check Hero Text
    try:
        page.wait_for_selector('h1:has-text("The World\'s Location Operating System")', timeout=5000)
        print("✅ Hero Headline Verified")
    except:
        print("❌ Hero Headline Missing")

    # Check Search Input
    try:
        page.wait_for_selector('input[placeholder="e.g., Rio de Janeiro, Brazil, 20000..."]', timeout=5000)
        print("✅ Hyper-Search Verified")
    except:
        print("❌ Hyper-Search Missing")

    # 2. Check City Page (Arusha)
    print("Navigating to City Page (Arusha)...")
    page.goto("http://localhost:3000/en/arusha")

    # Check Quick Insights
    try:
        page.wait_for_selector('div:has-text("Quick Insights")', timeout=10000)
        print("✅ Quick Insights Card Verified")
    except:
        print("❌ Quick Insights Card Missing")

    # Check Weather Data (Client-Side)
    try:
        page.wait_for_selector('div:has-text("°C")', timeout=15000)
        print("✅ Weather Data Verified")
    except:
        print("❌ Weather Data Missing (or failed to load)")

    # 3. Check Debug Page
    print("Navigating to Debug Page...")
    page.goto("http://localhost:3000/en/debug")

    try:
        page.wait_for_selector('h1:has-text("Black Box Diagnostics")', timeout=5000)
        page.wait_for_selector('table', timeout=5000)
        print("✅ Debug Page Table Verified")
    except:
        print("❌ Debug Page Missing")

    page.screenshot(path="verification/zero_failure_final.png", full_page=True)
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_zero_failure_final(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
