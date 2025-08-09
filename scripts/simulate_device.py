#!/usr/bin/env python3
"""
Simulate an ESP32 device sending continuous health data to the server (send-only).

Behavior:
- Send periodic POST requests to /api/records/ with headers x-device-id/x-device-secret
- Payload contains spo2 and heart_rate; server stamps timestamp and userId

Examples:
  Send 10 samples at 1.5s interval to a custom server URL:
    python scripts/simulate_device.py --id dev123 --secret s123 \
      --count 10 --interval 1.5 --server-url http://localhost:8001
"""

from __future__ import annotations

import argparse
import os
import random
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv


    # send-only script: no provisioning here


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Simulate ESP32 sending health data")
    parser.add_argument("--id", dest="device_id", required=True, help="Device ID")
    parser.add_argument("--secret", dest="device_secret", required=True, help="Device secret")
    parser.add_argument("--server-url", default="http://localhost:8001", help="Server base URL")
    parser.add_argument("--interval", type=float, default=2.0, help="Seconds between samples")
    parser.add_argument("--count", type=int, default=0, help="Number of samples to send (0=infinite)")
    parser.add_argument("--spo2-min", type=int, default=95, help="Min SpO2")
    parser.add_argument("--spo2-max", type=int, default=100, help="Max SpO2")
    parser.add_argument("--hr-min", type=int, default=60, help="Min heart rate")
    parser.add_argument("--hr-max", type=int, default=100, help="Max heart rate")
    parser.add_argument("--seed", type=int, default=None, help="Random seed for reproducibility")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    # Load .env.local (optional; not required for sending)
    load_dotenv(Path(__file__).resolve().parents[1] / ".env.local")

    if args.seed is not None:
        random.seed(args.seed)

    session = requests.Session()
    url = args.server_url.rstrip("/") + "/api/records/"
    headers = {
        "x-device-id": args.device_id,
        "x-device-secret": args.device_secret,
        "Content-Type": "application/json",
    }

    print("🚀 Starting device simulation →", args.device_id)
    print("   Server:", url)
    print("   Interval:", args.interval, "s | Count:", "∞" if args.count == 0 else args.count)
    print("   Ranges: SpO2[", args.spo2_min, ",", args.spo2_max, "] HR[", args.hr_min, ",", args.hr_max, "]")

    sent = 0
    try:
        while True:
            spo2 = random.randint(args.spo2_min, args.spo2_max)
            heart_rate = random.randint(args.hr_min, args.hr_max)
            payload = {"spo2": spo2, "heart_rate": heart_rate}
            try:
                resp = session.post(url, headers=headers, json=payload, timeout=10)
                if resp.status_code == 200:
                    key = resp.json().get("key")
                    print(f"✓ Sent: spo2={spo2} hr={heart_rate} → key={key}")
                else:
                    print(f"✗ Send failed ({resp.status_code}): {resp.text}")
            except requests.RequestException as e:
                print(f"✗ Network error: {e}")

            sent += 1
            if args.count and sent >= args.count:
                break
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\n🛑 Stopped by user")


if __name__ == "__main__":
    main()



