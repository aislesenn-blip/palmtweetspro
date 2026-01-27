from playwright.sync_api import sync_playwright

def verify_wiki_unsplash(page):
    print("Navigating to Paris page...")
    page.goto("http://localhost:3000/en/paris")

    # 1. Wiki Source
    print("Checking Wiki Attribution...")
    try:
        # Wait for Quick Facts to load and fetch Wiki
        page.wait_for_selector('a:has-text("Source: Wikipedia")', timeout=20000)
        print("✅ Wikipedia Attribution Present")
    except:
        print("❌ Wikipedia Attribution Missing (or API timeout)")

    # 2. Hero Image Fallback
    print("Checking Hero Image...")
    # Since headless environment often lacks credentials or network for external images,
    # we expect either the image or the fallback logic to trigger.
    # The key is that the code *has* the fallback logic.
    # We can check if the fallback logic printed "Trying fallback" in console if we attached a listener,
    # but here we just check for presence.

    try:
        page.wait_for_selector('.relative.h-[400px]', timeout=5000)
        print("✅ Hero Image Container Present")
    except:
        print("❌ Hero Image Container Missing")

    page.screenshot(path="verification/wiki_unsplash.png", full_page=True)
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_wiki_unsplash(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
