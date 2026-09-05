# Daily NSE Jewellery Scanner 💎📊

Automated daily 9:00 AM IST scanner for Indian NSE jewellery stocks with Breakout, Earnings results, Value filters, Telegram & WhatsApp alerts, and Gemini AI verdicts.

## 📌 Tracked Jewellery Stocks
1. **Goldiam International** (`GOLDIAM.NS`)
2. **Senco Gold** (`SENCO.NS`)
3. **Kalyan Jewellers** (`KALYANKJIL.NS`)
4. **Titan Company** (`TITAN.NS`)
5. **Radhika Jeweltech** (`RADHIKAJWE.NS`)
6. **PC Jeweller** (`PCJEWELLER.NS`)
7. **Tribhovandas Bhimji Zaveri** (`TBZ.NS`)
8. **Vaibhav Global** (`VAIBHAVGBL.NS`)

---

## 🎯 Filter Logic & Alert Types

- **Alert Type 1 - BREAKOUT**:
  `Price > 200 DMA` and `Volume > 2.0x 20-day average volume`
- **Alert Type 2 - RESULTS**:
  Checks quarterly earnings for `Sales Growth > 15% YoY` (and PAT growth) from Screener.in
- **Alert Type 3 - VALUE**:
  `PE < 15` AND `ROE > 15%` AND `Debt/Equity < 0.5`
- **AI Verdict**:
  Uses Gemini Flash (gemini-3.8-flash) to generate 1-line Buy/Hold/Sell verdict with concise reasoning.

---

## 🚀 Quick Start (Local PC)

### 1. Prerequisites
- Python 3.11+
- Git

### 2. Installation
```bash
git clone <repo-url>
cd daily-nse-jewellery-scanner
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Setup Credentials
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your keys:
- `GEMINI_API_KEY`: Your Google AI Studio Gemini API Key
- `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID`: From @BotFather and your chat/channel
- `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `WHATSAPP_NUMBER`: (Optional for WhatsApp)

### 4. Run Scanner
```bash
# Execute immediate manual scan
python main.py --scan-now

# Send a test alert to Telegram & WhatsApp
python main.py --test-alerts

# Run the automated 9:00 AM IST daemon (with dynamic watchdog time reloader)
python main.py --daemon
```

---

## ⏱️ Dynamic Time Configuration (`config.json`)

You can change the scan time on the fly in `config.json`:
```json
{
  "scan_time": "10:30",
  "cron": "0 9 * * *"
}
```
Thanks to `watchdog`, the daemon detects changes to `config.json` immediately and reschedules the daily trigger to the new time **without restarting the script**.

---

## ☁️ Deployment Instructions

### A. Deploy to Google Cloud Run (Jobs / Service)
1. Build container image:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/nse-scanner
   ```
2. Deploy as a Cloud Run Service or Cloud Run Job:
   ```bash
   gcloud run deploy nse-scanner \
     --image gcr.io/YOUR_PROJECT_ID/nse-scanner \
     --platform managed \
     --region asia-south1 \
     --set-env-vars GEMINI_API_KEY="your-gemini-key"
   ```
3. Or schedule via **Google Cloud Scheduler**:
   Create a Cron job triggering Cloud Run daily at `3:30 AM UTC` (`9:00 AM IST`).

### B. Deploy on Replit
1. Create a new Python Repl and import this repository.
2. In the **Secrets** tab (Environment variables), add:
   - `GEMINI_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
3. Hit **Run** or execute in the Replit Shell:
   ```bash
   python main.py --daemon
   ```
4. Set up an "Always-On" workflow or Uptime monitoring ping if running 24/7.

### C. Automated Execution with GitHub Actions (100% Free, Zero-Server)
A pre-configured GitHub Actions workflow is included at `.github/workflows/daily_scanner.yml`:
1. Push this repository to your GitHub account using the **Export to GitHub** feature in Google AI Studio.
2. In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**.
3. Add the following repository secrets:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID`: For Telegram notifications
   - `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `WHATSAPP_NUMBER`: For WhatsApp notifications (or `CALLMEBOT_API_KEY`)
4. GitHub Actions will automatically wake up and run the scanner Monday through Friday at **09:00 AM IST** (`03:30 UTC`), scan all 8 jewellery stocks, and dispatch alerts to your Telegram and WhatsApp!
5. You can also trigger an immediate scan at any time by going to the **Actions** tab in GitHub and clicking **Run workflow**.

### D. Android App (PWA & Native Install)
1. Open this application URL in Google Chrome on your Android phone.
2. Tap the in-app **"Install App"** button (or Chrome menu > "Add to Home screen").
3. Launch it directly from your Android launcher as a standalone app!
4. You can also run the Python scanner on Android directly inside **Termux**:
   ```bash
   pkg update && pkg install python
   pip install -r requirements.txt
   python main.py --scan-now
   ```
