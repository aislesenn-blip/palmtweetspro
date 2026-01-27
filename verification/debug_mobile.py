from playwright.sync_api import sync_playwright

def verify_mobile_ux(page):
    page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
    page.set_viewport_size({"width": 375, "height": 812})

    print("Navigating to Home Page...")
    page.goto("http://localhost:3000/en")
    page.wait_for_load_state("networkidle")

    buttons = page.locator('nav button')
    if buttons.count() > 0:
        buttons.first.click()
        print("Clicked menu button.")

        # Short wait
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/after_click.png")

        # Check if input is in DOM at all
        input_loc = page.locator('input[placeholder="Search globally..."]')
        if input_loc.count() > 0:
             print("Input found in DOM.")
             if input_loc.is_visible():
                 print("Input is visible.")
             else:
                 print("Input is NOT visible.")
        else:
             print("Input NOT found in DOM.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_mobile_ux(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
