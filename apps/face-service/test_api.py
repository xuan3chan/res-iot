import requests
import base64
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    try:
        r = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {r.status_code} - {r.json()}")
    except Exception as e:
        print(f"Health Check Failed: {e}")

def test_liveness():
    dummy_img = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNk+M+AARiHjAAAtx8F/mZ9TtUAAAAASUVORK5CYII="
    payload = {
        "frames": [dummy_img] * 10,
        "challenge_type": "BLINK",
        "challenge_passed": True
    }
    
    try:
        r = requests.post(f"{BASE_URL}/liveness-check", json=payload)
        print(f"Liveness Check ({r.url}): {r.status_code}")
        if r.status_code != 200:
            print(f"Response: {r.text}")
        else:
            print(f"Response: {r.json()}")
    except Exception as e:
        print(f"Liveness Check Failed: {e}")

def test_extract():
    dummy_img = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNk+M+AARiHjAAAtx8F/mZ9TtUAAAAASUVORK5CYII="
    payload = {
        "frames": [dummy_img]
    }
    try:
        r = requests.post(f"{BASE_URL}/extract-vector", json=payload)
        print(f"Extract Vector ({r.url}): {r.status_code}")
        if r.status_code != 200:
            print(f"Response: {r.text}")
        else:
            print(f"Response: {r.json()}")
    except Exception as e:
        print(f"Extract Failed: {e}")

if __name__ == "__main__":
    print("Running tests...")
    test_health()
    test_liveness()
    test_extract()
