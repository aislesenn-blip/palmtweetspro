from playwright.sync_api import sync_playwright

def verify_fix_visuals(page):
    print("Navigating to Paris page...")
    page.goto("http://localhost:3000/en/paris")

    # 1. Unsplash Hero Image
    print("Checking Hero Image...")
    try:
        # Check for image or fallback presence
        page.wait_for_selector('.relative.h-[400px]', timeout=10000)
        # Check if <img> tag exists or gradient fallback
        if page.locator('img.object-cover').count() > 0:
             print("✅ Hero Image Tag Found")
        elif page.locator('.bg-gradient-to-r').count() > 0:
             print("✅ Hero Image Fallback Found (Safe State)")
        else:
             print("❌ Hero Image/Fallback Missing")
    except:
        print("❌ Hero Container Missing")

    # 2. Comparison Dashboard Layout (Navigate to Comparison)
    print("Navigating to Comparison (London vs Tokyo)...")
    page.goto("http://localhost:3000/en/compare/london-vs-tokyo")

    print("Checking Comparison Layout...")
    try:
        # Check for grid with items-start
        page.wait_for_selector('.grid.items-start', timeout=10000)
        print("✅ Comparison Grid has items-start")

        # Check if cards are overflowing? (Hard to automate visual check of stretching without visual diff)
        # But we can check class presence.
        print("✅ Comparison Dashboard Loaded")
    except:
        print("❌ Comparison Dashboard Missing")

    page.screenshot(path="verification/visual_fix.png", full_page=True)
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_fix_visuals(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
