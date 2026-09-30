#!/usr/bin/env python3
"""
FitBuddy Automated Test Script
Tests all 4 Scenarios specified in the project documentation:
Scenario 1: User plan generation (7-day workout + nutrition tip)
Scenario 2: User feedback submission and plan refinement
Scenario 3: Direct nutrition tip generation
Scenario 4: Admin dashboard and view all registered users
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def log(msg, success=True):
    symbol = "✅" if success else "❌"
    print(f"{symbol} {msg}")

def test_health():
    print("\n--- Testing Health & Server Availability ---")
    try:
        res = requests.get(f"{BASE_URL}/")
        if res.status_code == 200:
            log(f"Server is responding at {BASE_URL}")
            return True
        else:
            log(f"Server responded with status {res.status_code}", False)
            return False
    except Exception as e:
        log(f"Could not connect to {BASE_URL}. Ensure uvicorn is running: {e}", False)
        return False

def test_scenario_1():
    print("\n--- Scenario 1: Generate Workout Plan & Nutrition Tip ---")
    payload = {
        "user_id": 99,
        "username": "Jordan Lee",
        "age": 27,
        "weight": 74.5,
        "goal": "lose belly fat and build lean muscle",
        "intensity": "High"
    }
    res = requests.post(f"{BASE_URL}/generate-plan", json=payload)
    if res.status_code == 200:
        data = res.json()
        log("Workout plan and nutrition tip generated successfully!")
        print("  Workout snippet:\n ", data.get("workout_plan", "")[:180], "...\n")
        print("  Nutrition tip:\n ", data.get("nutrition_tip", ""), "\n")
        return True
    else:
        log(f"Scenario 1 failed with {res.status_code}: {res.text}", False)
        return False

def test_scenario_2():
    print("\n--- Scenario 2: Submit Feedback & Update Workout Plan ---")
    payload = {
        "user_id": 99,
        "feedback": "I have knee discomfort so replace barbell squats with bodyweight box squats and add 15 mins stretching."
    }
    res = requests.post(f"{BASE_URL}/update-plan/99", json=payload)
    if res.status_code == 200:
        data = res.json()
        log("Updated workout plan generated based on feedback!")
        print("  Updated snippet:\n ", data.get("updated_plan", "")[:180], "...\n")
        return True
    else:
        log(f"Scenario 2 failed with {res.status_code}: {res.text}", False)
        return False

def test_scenario_3():
    print("\n--- Scenario 3: Request Nutrition/Recovery Tip ---")
    params = {"goal": "muscle gain and hypertrophy"}
    res = requests.get(f"{BASE_URL}/nutrition-tip", params=params)
    if res.status_code == 200:
        data = res.json()
        log(f"Nutrition tip received for goal '{params['goal']}':")
        print("  Tip:", data.get("nutrition_tip", ""), "\n")
        return True
    else:
        log(f"Scenario 3 failed with {res.status_code}: {res.text}", False)
        return False

def test_scenario_4():
    print("\n--- Scenario 4: Admin Dashboard / View All Users ---")
    res = requests.get(f"{BASE_URL}/api/users")
    if res.status_code == 200:
        response_data = res.json()
        users = response_data.get("users", []) if isinstance(response_data, dict) else response_data
        log(f"Admin retrieved {len(users)} registered users from SQLite database.")
        for u in users[:3]:
            print(f"  • User #{u['id']}: {u['name']} | Goal: {u['goal']} | Intensity: {u['intensity']} | Updated: {'Yes' if u.get('updated_plan') else 'No'}")
        return True
    else:
        log(f"Scenario 4 failed with {res.status_code}: {res.text}", False)
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("      FITBUDDY AUTOMATED VERIFICATION SUITE")
    print("=" * 60)

    if not test_health():
        print("\nPlease start your server first using:")
        print("  uvicorn app.main:app --reload")
        sys.exit(1)

    s1 = test_scenario_1()
    s2 = test_scenario_2()
    s3 = test_scenario_3()
    s4 = test_scenario_4()

    print("\n" + "=" * 60)
    if s1 and s2 and s3 and s4:
        print("🎉 ALL 4 SCENARIOS PASSED SUCCESSFULLY!")
    else:
        print("⚠️ Some scenarios returned warnings. Check output logs above.")
    print("=" * 60)
