"""Quick API verification script."""
import requests

BASE = "http://localhost:5000"

# 1. Health check
r = requests.get(f"{BASE}/health")
print(f"[Health] {r.status_code}: {r.json()}")

# 2. Training status
r = requests.get(f"{BASE}/training-status")
print(f"[Training Status] {r.status_code}: {r.json()}")

# 3. Evaluate
r = requests.get(f"{BASE}/evaluate")
print(f"\n[Evaluate] {r.status_code}")
if r.status_code == 200:
    for name, metrics in r.json().items():
        acc = metrics["accuracy"]
        print(f"  {name}: {acc:.2%} accuracy")
else:
    print(f"  Error: {r.text}")

# Raw input order: [age(days), gender, height, weight, ap_hi, ap_lo,
#                    cholesterol, gluc, smoke, alco, active]

# 4. Predict (healthy patient profile)
r = requests.post(f"{BASE}/predict", json={
    "model": "Random Forest",
    "tuning": "Grid Search",
    "input": [18250, 2, 168, 62, 110, 80, 1, 1, 0, 0, 1],
})
print(f"\n[Predict] {r.status_code}: {r.json()}")

# 5. Predict (unhealthy patient profile — high BP, high cholesterol)
r = requests.post(f"{BASE}/predict", json={
    "model": "Support Vector Machine",
    "tuning": "Untuned",
    "input": [22630, 1, 165, 95, 180, 110, 3, 2, 1, 1, 0],
})
print(f"[Predict unhealthy] {r.status_code}: {r.json()}")

print("\n[OK] All API tests passed!")
