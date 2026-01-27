from playwright.sync_api import sync_playwright

def verify_mobile_ux(page):
    # Set viewport to mobile size
    page.set_viewport_size({"width": 375, "height": 812})

    print("Navigating to Home Page...")
    page.goto("http://localhost:3000/en")
    page.wait_for_load_state("networkidle")

    print("Checking Hamburger Menu...")
    # There should be a button in the nav
    # The button toggles the menu.
    # It has the Menu icon (lucide-react).

    # Try finding the button by checking for the Menu icon inside it, or just the button element.
    # <button className="rounded-full p-2 hover:bg-black/5 md:hidden">

    # Let's try to get all buttons and find the visible one.
    buttons = page.locator('nav button')
    count = buttons.count()
    print(f"Found {count} buttons in nav.")

    menu_btn = None
    for i in range(count):
        btn = buttons.nth(i)
        if btn.is_visible():
            print(f"Button {i} is visible.")
            menu_btn = btn
            break

    if menu_btn:
        menu_btn.click()
        print("Clicked menu button.")
    else:
        print("No visible menu button found.")
        return

    # Check for mobile search input visibility
    # <input placeholder="Search globally..." ... />
    page.wait_for_selector('input[placeholder="Search globally..."]', state='visible')
    print("Mobile Search Input is visible.")

    page.screenshot(path="verification/mobile_menu.png")
    print("Mobile menu screenshot taken.")

    print("Performing Search for 'Sydney'...")
    page.fill('input[placeholder="Search globally..."]', 'Sydney')
    page.press('input[placeholder="Search globally..."]', 'Enter')

    # Wait for navigation to Sydney dashboard
    page.wait_for_url('**/en/sydney')

    page.wait_for_selector('h1:has-text("Sydney")', timeout=20000)

    page.screenshot(path="verification/mobile_search_result.png")
    print("Search result screenshot taken.")

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
