from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pyodbc
from fpdf import FPDF
import os
import re
from datetime import datetime
import csv
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQL Server bağlantı bilgileri
server = '127.0.0.1\\SQLEXPRESS'
database = 'TwiTrends_1'
username = 'sa'
password = '1234Koray!'

# Raporların kaydedileceği klasör
REPORT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'TwiTrends-Backend', 'report_files'))

# Türkçe font
FONT_PATH = r"C:\TwiFonts\DejaVuSans.ttf"  

def clean_text(text):
    return re.sub(r'[^\x00-\x7FğüşıöçĞÜŞİÖÇ.,;:!?()@%&a-zA-Z0-9\s]', '', text)

def extract_username(text):
    match = re.search(r'@(\w+)', text)
    return f"@{match.group(1)}" if match else "Bilinmiyor"

def fetch_tweets(keyword):
    conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}"
    conn = pyodbc.connect(conn_str)
    query = f"""
        SELECT DISTINCT tweet_date, sentiment, content
        FROM Tweets
        WHERE content LIKE '%{keyword}%'  -- Burada keyword parametresi ile filtreleme ekliyoruz
        ORDER BY tweet_date DESC
    """
    df = pd.read_sql(query, conn)
    conn.close()
    df['tweet_date'] = pd.to_datetime(df['tweet_date'], errors='coerce')
    df['username'] = df['content'].apply(extract_username)
    return df

def create_csv(df, filename):
    df = df.rename(columns={
        'tweet_date': 'Tarih',
        'sentiment': 'Duygu',
        'username': 'Kullanıcı',
        'content': 'Tweet'
    })

    export_df = df[['Tarih', 'Duygu', 'Kullanıcı', 'Tweet']].copy()

    # Tweet içeriğini temizle: satır atlamaları, tırnak
    export_df['Tweet'] = export_df['Tweet'].apply(
        lambda x: clean_text(str(x)).replace("\n", " ").replace("\r", " ").replace('"', "'")
    )

    path = os.path.join(REPORT_DIR, filename + ".csv")

    # Excel'de Türkçe karakter desteği için utf-8-sig + quoting
    export_df.to_csv(
        path,
        index=False,
        encoding="utf-8-sig",
        quoting=csv.QUOTE_ALL
    )
    return path

def create_pdf(df, filename):
    path = os.path.join(REPORT_DIR, filename + ".pdf")
    pdf = FPDF()
    pdf.add_page()
    pdf.add_font("DejaVu", "", FONT_PATH, uni=True)
    pdf.set_font("DejaVu", size=9)

    # Başlık satırı
    pdf.set_fill_color(230, 230, 230)
    pdf.set_text_color(0)
    pdf.cell(45, 8, "Tarih", 1, 0, 'L', 1)
    pdf.cell(25, 8, "Duygu", 1, 0, 'L', 1)
    pdf.cell(40, 8, "Kullanıcı", 1, 0, 'L', 1)
    pdf.cell(80, 8, "Tweet İçeriği", 1, 1, 'L', 1)

    for _, row in df.iterrows():
        date = str(row['tweet_date'])[:19]
        sentiment = str(row['sentiment']).capitalize()
        user = str(row['username'])[:25]
        content = clean_text(str(row['content'])[:250])

        pdf.cell(45, 8, date, 1)
        pdf.cell(25, 8, sentiment, 1)
        pdf.cell(40, 8, user, 1)
        pdf.multi_cell(80, 8, content, border=1)
        pdf.ln(0.5)

    pdf.output(path)
    return path

class ReportRequest(BaseModel):
    keyword: str

@app.post("/generate-report")
def generate_report(payload: ReportRequest):
    keyword = payload.keyword.replace(" ", "_").lower()
    df = fetch_tweets(keyword) 
    if df.empty:
        return {"message": "Veri bulunamadı."}

    now = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    base_name = f"report_{keyword}_{now}"

    # CSV ve PDF dosyalarını oluştur
    csv_path = create_csv(df, base_name)
    pdf_path = create_pdf(df, base_name)

    new_report = {
        "name": base_name,
        "date": now,
        "format": "CSV",
        "url": f"/reports/download/{os.path.basename(csv_path)}"
    }

    print(f"Rapor oluşturuldu: {base_name}")  

    return {
        "message": "Rapor oluşturuldu",
        "new_report": new_report
    }

@app.get("/reports")
def list_reports():
    files = os.listdir(REPORT_DIR)
    return files

@app.get("/reports/download/{filename}")
def download_report(filename: str):
    full_path = os.path.join(REPORT_DIR, filename)
    if os.path.exists(full_path):
        return FileResponse(full_path, filename=filename)
    return {"error": "Dosya bulunamadı"}

@app.delete("/reports/{filename}")
def delete_report(filename: str):
    full_path = os.path.join(REPORT_DIR, filename)
    if os.path.exists(full_path):
        os.remove(full_path)
        return {"message": f"{filename} silindi"}
    else:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
