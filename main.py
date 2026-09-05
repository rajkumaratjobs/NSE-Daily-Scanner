#!/usr/bin/env python3
"""
Daily NSE Jewellery Scanner - main.py
Continuous scheduler and file watchdog daemon.

Features:
- Dynamic time reloading via watchdog: Monitors config.json for changes to scan_time
- Daily schedule at 9:00 AM IST (or custom time from config.json)
- Dispatches alerts via Telegram (python-telegram-bot) and WhatsApp (Twilio API)
- CLI options: --scan-now, --test-alerts, --daemon
"""

import os
import sys
import time
import json
import logging
import asyncio
import argparse
from typing import Optional
from dotenv import load_dotenv
import schedule
import pytz
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Import core scanner
from scanner import run_nse_jewellery_scan, load_config, DEFAULT_CONFIG_PATH

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("NSEDaemon")

IST = pytz.timezone("Asia/Kolkata")


async def send_telegram_alert(message: str, config: dict = None) -> bool:
    """Send formatted alert via python-telegram-bot."""
    tg_cfg = (config or {}).get("notifications", {}).get("telegram", {})
    bot_token = (tg_cfg.get("bot_token") or os.environ.get("TELEGRAM_BOT_TOKEN", "")).strip()
    chat_id = (tg_cfg.get("chat_id") or os.environ.get("TELEGRAM_CHAT_ID", "")).strip()

    if not bot_token or not chat_id or bot_token == "your_telegram_bot_token_here":
        logger.warning("Telegram alert skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in config.json or .env")
        return False

    try:
        from telegram import Bot
        bot = Bot(token=bot_token)
        await bot.send_message(chat_id=chat_id, text=message)
        logger.info(f"Telegram alert sent successfully to chat {chat_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to send Telegram alert: {e}")
        return False


def send_whatsapp_alert(message: str, config: dict = None) -> bool:
    """Send formatted alert via CallMeBot or Twilio WhatsApp API."""
    wa_cfg = (config or {}).get("notifications", {}).get("whatsapp", {})
    
    # 1. Check CallMeBot first (Free WhatsApp gateway)
    callmebot_key = (wa_cfg.get("callmebot_key") or os.environ.get("CALLMEBOT_API_KEY", "")).strip()
    callmebot_phone = (wa_cfg.get("callmebot_phone") or wa_cfg.get("to_number") or os.environ.get("CALLMEBOT_PHONE", "") or os.environ.get("WHATSAPP_NUMBER", "")).strip()
    
    if callmebot_key and callmebot_phone:
        try:
            import urllib.parse
            import urllib.request
            clean_phone = "".join(c for c in callmebot_phone if c.isdigit())
            encoded_text = urllib.parse.quote(message)
            url = f"https://api.callmebot.com/whatsapp.php?phone={clean_phone}&text={encoded_text}&apikey={callmebot_key}"
            req = urllib.request.Request(url, headers={"User-Agent": "NSE-Jewellery-Alerts/1.0"})
            with urllib.request.urlopen(req, timeout=12) as resp:
                body = resp.read().decode("utf-8")
                if "Message queued" in body or "Message sent" in body or resp.status == 200:
                    logger.info("WhatsApp alert sent successfully via CallMeBot API!")
                    return True
                else:
                    logger.warning(f"CallMeBot response: {body}")
        except Exception as e:
            logger.error(f"CallMeBot dispatch error: {e}")

    # 2. Twilio WhatsApp API
    account_sid = (wa_cfg.get("account_sid") or os.environ.get("TWILIO_SID", "")).strip()
    auth_token = (wa_cfg.get("auth_token") or os.environ.get("TWILIO_AUTH_TOKEN", "")).strip()
    raw_from = (wa_cfg.get("from_number") or os.environ.get("TWILIO_WHATSAPP_NUMBER", "+14155238886")).strip()
    to_whatsapp = (wa_cfg.get("to_number") or os.environ.get("WHATSAPP_NUMBER", "")).strip()

    if not account_sid or not auth_token or account_sid.startswith("your_"):
        logger.warning("WhatsApp alert skipped: TWILIO_SID or TWILIO_AUTH_TOKEN not configured in config.json or .env")
        return False

    if not account_sid.startswith("AC"):
        logger.error(
            f"Twilio SID Format Error (Code 20003): Current SID starts with '{account_sid[:2]}'. "
            "Twilio Account SIDs ALWAYS start with 'AC' (34 chars). "
            "Please copy the Account SID from https://console.twilio.com"
        )
        return False

    if not to_whatsapp:
        logger.warning("WhatsApp alert skipped: target WHATSAPP_NUMBER not set in config.json or .env")
        return False

    # Auto-fallback from personal number to Twilio Sandbox if needed
    clean_from = "".join(c for c in raw_from if c.isdigit())
    if clean_from.startswith("91") and len(clean_from) == 12:
        # Personal mobile number mistakenly put in TWILIO_WHATSAPP_NUMBER
        from_whatsapp = "+14155238886"
    else:
        from_whatsapp = raw_from if raw_from else "+14155238886"

    try:
        from twilio.rest import Client
        import time

        client = Client(account_sid, auth_token)

        from_str = f"whatsapp:{from_whatsapp}" if not from_whatsapp.startswith("whatsapp:") else from_whatsapp
        to_str = f"whatsapp:{to_whatsapp}" if not to_whatsapp.startswith("whatsapp:") else to_whatsapp

        # Twilio has a 1600 character limit per WhatsApp message (Error 21617)
        # Split message cleanly if it exceeds 1450 characters
        max_len = 1450
        if len(message) <= max_len:
            chunks = [message]
        else:
            paragraphs = message.split("\n\n")
            chunks = []
            curr = ""
            for p in paragraphs:
                candidate = f"{curr}\n\n{p}" if curr else p
                if len(candidate) <= max_len:
                    curr = candidate
                else:
                    if curr:
                        chunks.append(curr)
                    if len(p) > max_len:
                        for i in range(0, len(p), max_len):
                            chunks.append(p[i:i + max_len])
                        curr = ""
                    else:
                        curr = p
            if curr:
                chunks.append(curr)

        sids = []
        for idx, chunk in enumerate(chunks):
            prefix = f"[Part {idx + 1}/{len(chunks)}]\n" if len(chunks) > 1 else ""
            msg = client.messages.create(
                body=f"{prefix}{chunk}",
                from_=from_str,
                to=to_str
            )
            sids.append(msg.sid)
            if idx < len(chunks) - 1:
                time.sleep(0.6)

        logger.info(f"WhatsApp alert sent successfully via Twilio SID(s): {', '.join(sids)}")
        return True
    except Exception as e:
        logger.error(f"Failed to send WhatsApp alert via Twilio: {e}")
        return False


def dispatch_alerts(message: str, config: dict):
    """Dispatches message to both Telegram and WhatsApp if enabled."""
    notifications = config.get("notifications", {})
    
    if notifications.get("telegram", {}).get("enabled", True):
        try:
            asyncio.run(send_telegram_alert(message, config))
        except Exception as e:
            logger.error(f"Telegram dispatch error: {e}")

    if notifications.get("whatsapp", {}).get("enabled", True):
        try:
            send_whatsapp_alert(message, config)
        except Exception as e:
            logger.error(f"WhatsApp dispatch error: {e}")


def execute_daily_job():
    """Main job executed by schedule."""
    logger.info("Executing scheduled NSE Jewellery Scan...")
    config = load_config()
    scan_result = run_nse_jewellery_scan(config)
    message = scan_result["formatted_message"]
    
    # Print to console / container log
    print("\n" + "=" * 60)
    print(f"DAILY SCAN EXECUTED AT {datetime.now(IST).strftime('%Y-%m-%d %H:%M:%S IST')}")
    print("=" * 60)
    print(message)
    print("=" * 60 + "\n")

    # Send alerts
    dispatch_alerts(message, config)


class ConfigFileHandler(FileSystemEventHandler):
    """Watchdog event handler to catch config.json edits on the fly."""
    def __init__(self, scheduler_manager):
        self.scheduler_manager = scheduler_manager
        self.last_modified = 0

    def on_modified(self, event):
        if event.src_path.endswith("config.json"):
            # Debounce quick multiple file-save triggers
            curr_time = time.time()
            if curr_time - self.last_modified > 1.0:
                self.last_modified = curr_time
                logger.info("Detected change in config.json! Reloading schedule dynamically...")
                self.scheduler_manager.reload_schedule()


class SchedulerManager:
    """Manages dynamic schedule registration and watchdog."""
    def __init__(self, config_path: str = DEFAULT_CONFIG_PATH):
        self.config_path = config_path
        self.current_scan_time = "09:00"
        self.observer = None
        self.scheduled_job = None

    def parse_time_from_config(self) -> str:
        """Parse HH:MM format from scan_time or cron field."""
        try:
            cfg = load_config(self.config_path)
            # Support direct "09:00" or cron format "0 9 * * *"
            scan_time = cfg.get("scan_time", "09:00").strip()
            if ":" in scan_time:
                return scan_time
            
            # If cron like "0 9 * * *"
            cron_str = cfg.get("cron", "")
            parts = cron_str.split()
            if len(parts) >= 2 and parts[0].isdigit() and parts[1].isdigit():
                return f"{int(parts[1]):02d}:{int(parts[0]):02d}"
        except Exception as e:
            logger.warning(f"Could not parse scan_time from config: {e}. Defaulting to 09:00.")
        return "09:00"

    def reload_schedule(self):
        """Reschedules the job dynamically without restarting the process."""
        new_time = self.parse_time_from_config()
        if new_time != self.current_scan_time or self.scheduled_job is None:
            schedule.clear()
            self.current_scan_time = new_time
            self.scheduled_job = schedule.every().day.at(new_time).do(execute_daily_job)
            logger.info(f"✨ Successfully updated next daily scan to: {new_time} (Asia/Kolkata IST) without restart!")
        else:
            logger.info(f"Scan time remained unchanged at {self.current_scan_time}.")

    def start_watchdog(self):
        """Starts watchdog filesystem observer on the config directory."""
        config_dir = os.path.dirname(os.path.abspath(self.config_path))
        event_handler = ConfigFileHandler(self)
        self.observer = Observer()
        self.observer.schedule(event_handler, path=config_dir, recursive=False)
        self.observer.start()
        logger.info(f"Watchdog active on {config_dir}/config.json for dynamic time updates.")

    def run_loop(self):
        """Main daemon loop."""
        self.reload_schedule()
        self.start_watchdog()
        logger.info("NSE Jewellery Scanner Daemon is now running. Press Ctrl+C to terminate.")

        try:
            while True:
                # Run scheduled tasks
                schedule.run_pending()
                time.sleep(1)
        except (KeyboardInterrupt, SystemExit):
            logger.info("Shutting down scanner daemon...")
            if self.observer:
                self.observer.stop()
                self.observer.join()


def main():
    parser = argparse.ArgumentParser(description="Daily NSE Jewellery Scanner Daemon")
    parser.add_argument("--scan-now", action="store_true", help="Execute an immediate scan and print/send results")
    parser.add_argument("--test-alerts", action="store_true", help="Send a test notification to Telegram and WhatsApp")
    parser.add_argument("--daemon", action="store_true", help="Run in continuous daemon mode with scheduler and watchdog")
    args = parser.parse_args()

    if args.scan_now:
        logger.info("Executing immediate on-demand scan...")
        execute_daily_job()
        return

    if args.test_alerts:
        logger.info("Sending test alerts to Telegram & WhatsApp...")
        test_msg = (
            "🚨 NSE SCAN TEST ALERT\n"
            "This is a test notification from Daily NSE Jewellery Scanner.\n"
            "System is active and connected."
        )
        dispatch_alerts(test_msg, load_config())
        return

    # Default to daemon mode
    manager = SchedulerManager()
    manager.run_loop()


if __name__ == "__main__":
    main()
