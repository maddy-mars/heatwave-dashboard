#!/usr/bin/env python3
"""
Heatwave Alert Script — India Heatwave Dashboard
Usage:
  python heatwave_alert.py              # Hourly threshold check
  python heatwave_alert.py --briefing   # Daily top-10 briefing
"""

import json
import os
import sys
import requests
import time

# Alert thresholds and labels
THRESHOLDS = [
    (45, "\U0001f534 DANGER"),   # Red
    (43, "\U0001f7e0 EXTREME"),  # Orange
    (40, "\U0001f7e1 HOT"),      # Yellow
]

TELEGRAM_API = "https://api.telegram.org/bot{token}/sendMessage"


def load_cities(path: str = "public/india_cities.json") -> list:
    """Load city data from the dashboard JSON file."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def fetch_temperatures(cities: list) -> list:
    """Fetch current temperatures from Open-Meteo API in one bulk call."""
    lats = ",".join(str(c["lat"]) for c in cities)
    lons = ",".join(str(c["lng"]) for c in cities)

    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lats}&longitude={lons}"
        "&current=temperature_2m"
    )

    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    results = []
    for i, city in enumerate(cities):
        try:
            temp = data[i]["current"]["temperature_2m"]
            results.append({**city, "temperature": temp})
        except (KeyError, IndexError, TypeError):
            results.append({**city, "temperature": None})

    return results


def send_telegram(message: str, parse_mode: str = "HTML"):
    """Send a message to the configured Telegram channel."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHANNEL_ID")

    if not token or not chat_id:
        print("ERROR: TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be set")
        sys.exit(1)

    url = TELEGRAM_API.format(token=token)

    # Telegram has a ~4096 char limit — split if needed
    max_len = 4000
    parts = []
    remaining = message
    while len(remaining) > max_len:
        split_at = remaining.rfind("\n", 0, max_len)
        if split_at == -1:
            split_at = max_len
        parts.append(remaining[:split_at])
        remaining = remaining[split_at:].strip()
    if remaining:
        parts.append(remaining)

    for part in parts:
        resp = requests.post(
            url,
            json={"chat_id": chat_id, "text": part, "parse_mode": parse_mode},
            timeout=15,
        )
        if resp.status_code != 200:
            print(f"Telegram send error: {resp.text}")
        time.sleep(0.5)  # polite rate limiting


def format_alert(city: dict) -> str:
    """Format a single city threshold alert."""
    return (
        f"\U0001f321\ufe0f <b>{city['city']}, {city['state']}</b>\n"
        f"Temperature: <b>{city['temperature']}\u00b0C</b>\n"
        f"Risk: {city['risk']}"
    )


def run_alerts(cities_data: list):
    """Check thresholds and post alerts for cities that crossed."""
    alerts = []
    for city in cities_data:
        temp = city.get("temperature")
        if temp is None:
            continue
        for threshold, label in THRESHOLDS:
            if temp >= threshold:
                city["risk"] = label
                alerts.append(format_alert(city))
                break

    if alerts:
        header = "\U0001f6a8 <b>Heatwave Alert</b>\n\n"
        message = header + "\n\n".join(alerts)
        send_telegram(message)
        print(f"Sent {len(alerts)} alert(s)")
    else:
        print("No thresholds crossed.")


def run_briefing(cities_data: list):
    """Post the top-10 hottest cities nationally."""
    valid = [c for c in cities_data if c.get("temperature") is not None]
    valid.sort(key=lambda c: c["temperature"], reverse=True)
    top10 = valid[:10]

    if not top10:
        print("No temperature data available — skipping briefing.")
        return

    lines = [
        "\U0001f4ca <b>India Heatwave Briefing \u2014 Top 10 Hottest Cities</b>\n"
    ]
    for i, city in enumerate(top10, 1):
        t = city["temperature"]
        risk = "\U0001f534" if t >= 45 else "\U0001f7e0" if t >= 43 else "\U0001f7e1" if t >= 40 else "\u2705"
        lines.append(
            f"{i}. {risk} <b>{city['city']}, {city['state']}</b> \u2014 {t}\u00b0C"
        )

    lines.append(
        "\n\U0001f310 <a href='https://heatwave-dashboard.vercel.app'>"
        "View Live Dashboard</a>"
    )

    message = "\n".join(lines)
    send_telegram(message)
    print(f"Briefing sent: top {len(top10)} cities.")


def main():
    if not os.path.exists("public/india_cities.json"):
        # Try relative to script directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(os.path.join(script_dir, ".."))

    cities = load_cities()
    print(f"Loaded {len(cities)} cities.")

    data = fetch_temperatures(cities)
    print(f"Fetched temperatures for {len(cities)} cities.")

    if "--briefing" in sys.argv:
        run_briefing(data)
    else:
        run_alerts(data)


if __name__ == "__main__":
    main()
