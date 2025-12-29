import os
import sys
import time
import random
import requests
import urllib.parse
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from playwright.sync_api import sync_playwright, TimeoutError

# === CONFIG ===
BACKEND_URL = "http://localhost:3001/api/tweets/add"
REPORT_URL = "http://localhost:3001/api/reports/generate"
MAX_TWEETS = 100
SESSION_FILE = "session.json"
REAL_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"

# === SECRET FILTER ===
key = b'ZXzwigJ8m-PmUanS5fu1-Y2uAMCRCGBaYh1qIzOq-D4='
cipher = Fernet(key)
encrypted_block = [
    b'gAAAAABoBpJ4d7A2uoWN79P03qls5DY1SRTznBbXuULJcXxV13Oz3Svb5eM8pY5UozzM9kXImC2heud17q3LpyyL3rMf4sJKNg==',
    b'gAAAAABoBpJ4wwSHxfhnfbfBHKcYJVWRJkX4J0XKY3czdUDJrpv0c0N30HR3Xzz_vOONWeGq0GhWO63gKp_DS45kZByuCeCCLg==',
    b'gAAAAABoBpJ4Kn8HQGzc0dtWJxBDbAAmy8dUmbFjI_6EW_Qh0U5R1vjm_Hwv70i0F3jH31-Rsd2-E5vSwBZQXhjsllXXYSWl3g==' 
]
banned_words = [cipher.decrypt(w).decode() for w in encrypted_block]

def safe_print(text):
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode("ascii", errors="ignore").decode())

def send_to_backend(tweet, tweet_date, keyword, start_date, end_date, user_id):
    try:
        
        response = requests.post(BACKEND_URL, json={
            "content": tweet,
            "tweet_date": tweet_date,
            "keyword": keyword,  
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "user_id": user_id
        })
        if response.status_code == 201:
            safe_print("✔ Tweet kaydedildi.")
        elif response.status_code == 409:
            safe_print("⚠ Tweet zaten mevcut.")
        else:
            safe_print("✖ Gönderilemedi: " + response.text)
    except Exception as e:
        safe_print("✖ Backend hatası: " + str(e))

def wait_for_tweets(page):
    try:
        page.wait_for_selector("article", timeout=10000)
        return True
    except TimeoutError:
        safe_print("⚠ Tweetler yüklenemedi. Sayfa atlanıyor.")
        return False

def is_valid_tweet(text):
    lower = text.lower()
    if len(text.strip()) < 20: return False
    if "https://" in lower or "http://" in lower or "t.co/" in lower: return False
    if "replying to" in lower or "yanıt olarak" in lower: return False
    if any(bad in lower for bad in ["reload", "could not", "load failed"]): return False
    if sum(c.isdigit() for c in text) > len(text) * 0.5: return False
    if "@" in text and text.count("@") > 3: return False
    if any(bad in lower for bad in banned_words): return False
    return True

def scrape_day(page, keyword, since, until, daily_limit, tweet_set, user_id):
    since_str = since.strftime("%Y-%m-%d")
    until_str = until.strftime("%Y-%m-%d")
    query = f"{keyword} since:{since_str} until:{until_str}"
    encoded = urllib.parse.quote(query)
    url = f"https://twitter.com/search?q={encoded}&src=typed_query&f=live"

    safe_print(f"\n🔍 Arama: {query}")
    try:
        page.goto(url, wait_until="load")
        time.sleep(2)
    except:
        safe_print("❌ Sayfa açılamadı, gün atlanıyor.")
        return 0

    if not wait_for_tweets(page):
        return 0

    collected, scrolls, last_count = 0, 0, 0

    while collected < daily_limit and scrolls < 15:
        page.mouse.wheel(0, 3000)
        time.sleep(2)
        tweets = page.locator("article").all()
        safe_print(f">> Taranan: {len(tweets)} tweet")

        if len(tweets) == last_count:
            safe_print("⚠ Yeni tweet yüklenmedi, scroll sonlandırılıyor.")
            break
        last_count = len(tweets)

        for tweet in tweets:
            try:
                content = tweet.inner_text().encode("utf-8", errors="ignore").decode("utf-8")
                if content in tweet_set or not is_valid_tweet(content):
                    continue
                try:
                    time_element = tweet.locator("time")
                    tweet_datetime = time_element.get_attribute("datetime")
                    tweet_time = datetime.strptime(tweet_datetime, "%Y-%m-%dT%H:%M:%S.%fZ")
                    tweet_time_str = tweet_time.strftime("%Y-%m-%d %H:%M:%S")
                except Exception as e:
                    safe_print("⚠ Zaman bilgisi alınamadı: " + str(e))
                    tweet_time_str = since_str
                send_to_backend(content, tweet_time_str, keyword, since, until, user_id)
                tweet_set.add(content)
                collected += 1
                if collected >= daily_limit:
                    break
            except Exception as e:
                safe_print("Tweet okunamadı: " + str(e))
        scrolls += 1

    return collected

def split_into_blocks(start_date, end_date, block_size):
    blocks, current = [], start_date
    while current < end_date:
        block_end = min(current + timedelta(days=block_size), end_date)
        blocks.append((current, block_end))
        current = block_end
    return blocks

def select_random_days(block_start, block_end, count):
    days = [block_start + timedelta(days=i) for i in range((block_end - block_start).days)]
    return random.sample(days, min(count, len(days)))

def generate_report(keyword, start_date, end_date, user_id):
    try:
        response = requests.post(REPORT_URL, json={
            "keyword": keyword,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "user_id": user_id
        }, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            safe_print("📄 Rapor oluşturuldu.")
        else:
            safe_print(f"❌ Rapor oluşturulamadı: {response.status_code} - {response.text}")
    except Exception as e:
        safe_print(f"❌ Rapor oluşturma hatası: {e}")


def run_scraper():
    if len(sys.argv) < 5:
        safe_print("Kullanım: python full_scraper.py <keyword> <start_date> <end_date> <user_id>")
        return

    keyword = sys.argv[1]
    start_date = datetime.strptime(sys.argv[2], "%Y-%m-%d")
    end_date = datetime.strptime(sys.argv[3], "%Y-%m-%d")
    user_id = int(sys.argv[4])

    tweet_set = set()
    total_days = (end_date - start_date).days + 1
    safe_print(f">> Scraper başladı: '{keyword}' ({start_date.date()} - {end_date.date()}) [user_id: {user_id}]")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            storage_state=SESSION_FILE if os.path.exists(SESSION_FILE) else None,
            locale="tr-TR", timezone_id="Europe/Istanbul",
            user_agent=REAL_USER_AGENT, viewport={"width": 1280, "height": 800}
        )

        if not os.path.exists(SESSION_FILE):
            page = context.new_page()
            page.goto("https://twitter.com/login", wait_until="domcontentloaded", timeout=60000)
            safe_print(">> Lütfen giriş yapın... (manuel)")

            for i in range(15, 0, -1):
                safe_print(f">> Giriş süresi: {i} sn")
                time.sleep(1)
            context.storage_state(path=SESSION_FILE)

        page = context.new_page()
        total_collected = 0

        if total_days <= 30:
            daily_limit = max(1, MAX_TWEETS // total_days)
            for i in range(total_days):
                day = start_date + timedelta(days=i)
                total_collected += scrape_day(page, keyword, day, day + timedelta(days=1), daily_limit, tweet_set, user_id)
        else:
            blocks = split_into_blocks(start_date, end_date, 14)
            for block_start, block_end in blocks:
                for day in select_random_days(block_start, block_end, 4):
                    total_collected += scrape_day(page, keyword, day, day + timedelta(days=1), MAX_TWEETS // len(blocks) // 4, tweet_set, user_id)

        browser.close()
        safe_print(f"\n Toplam {total_collected} tweet işlendi.")

        
        generate_report(keyword, start_date, end_date, user_id)

if __name__ == "__main__":
    run_scraper()

