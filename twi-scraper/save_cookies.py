from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    
    # Twitter giriş sayfasına git
    page.goto("https://twitter.com/login")
    print("🟢 Lütfen giriş yap ve ardından terminale geri dön.")
    input("✅ Giriş yaptıysan ENTER'a bas: ")

    # Çerezleri kaydet
    cookies = context.cookies()
    with open("twitter_cookies.json", "w", encoding="utf-8") as f:
        json.dump(cookies, f, indent=2)
    print("✅ Cookie dosyası oluşturuldu.")

    browser.close()
