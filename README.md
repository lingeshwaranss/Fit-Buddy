# FitBuddy – AI Fitness Plan Generator using Gemini Models

FitBuddy is an AI-powered fitness application built with **FastAPI**, **Google Gemini Models**, **SQLite**, and **SQLAlchemy**. It generates personalized 7-day workout plans, provides actionable nutrition and recovery advice, and iteratively refines routines using an intelligent user feedback loop.

---

## 📋 Features & Supported Scenarios

1. **Scenario 1 – Personalized 7-Day Workout & Nutrition Plan**
   - Captures User ID, Name, Age, Weight, Fitness Goal, and Intensity (*Low*, *Medium*, *High*).
   - Generates structured day-wise plans with Warm-up (5–10 mins), Main Workout (exercises, sets & reps), and Cooldowns using Gemini models.
   - Generates concise dietary advice using Gemini Flash.
   - Stores user profiles and generated plans in SQLite (`fitbuddy.db`).

2. **Scenario 2 – Feedback-Driven Plan Refinement**
   - Users submit feedback (e.g., *"Add yoga on rest days"*, *"More cardio focus"*, *"Knee pain adjustments"*).
   - Gemini updates and personalizes the plan while preserving the original version in the database.
   - Renders confirmation banner: `✅ Your plan has been updated based on your feedback!`.

3. **Scenario 3 – Targeted Nutrition & Recovery Advice**
   - Provides instant, goal-aligned nutrition tips (protein targets, hydration, nutrient timing).

4. **Scenario 4 – Coach & Admin Dashboard (`/view-all-users`)**
   - Displays all registered users, fitness metrics, original plans, and updated plans in a clear table.

---

## 🛠️ VS Code Setup & Local Installation

### 1. Prerequisites
- **Python 3.10+** installed on your system.
- **VS Code** with the following recommended extensions:
  - *Python* (by Microsoft)
  - *Pylance*
  - *SQLite Viewer* (to inspect `fitbuddy.db` directly in VS Code)

### 2. Open Project in VS Code
Open the repository root in VS Code:
```bash
code .
```

### 3. Create & Activate Virtual Environment
Open the VS Code Terminal (`Ctrl + \`` or `Cmd + \``):

**On Linux / macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**On Windows (Command Prompt or PowerShell):**
```bash
py -m venv .venv
.venv\Scripts\Activate.ps1
```

### 4. Install Dependencies
```bash
py -m pip install -r fitbuddy/requirements.txt
```

### 5. Configure API Key
Create a `.env` file in the root of the project:
```bash
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GOOGLE_API_KEY="your_actual_gemini_api_key_here"
```
*(Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/)).*

---

## Running the Application

Run the Python/Jinja2 application from the repository root:
```bash
py -m uvicorn fitbuddy.app.main:app --reload --port 8000
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) for the app and [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for API documentation.

---

## 🧪 Testing the Application

### Option A: Run the Automated Test Suite
With the server running in one terminal, open a second terminal and execute:
```bash
py fitbuddy/test_api.py
```
This tests all 4 milestones/scenarios and prints live status logs.

### Option B: Test via cURL

**1. Generate Plan:**
```bash
curl -X POST "http://127.0.0.1:8000/generate-plan" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": 105,
       "username": "Sarah Conner",
       "age": 29,
       "weight": 63.5,
       "goal": "endurance and tone",
       "intensity": "High"
     }'
```

**2. Submit Feedback:**
```bash
curl -X POST "http://127.0.0.1:8000/update-plan/105" \
     -H "Content-Type: application/json" \
     -d '{
       "feedback": "Include 20 minutes of restorative stretching on day 4."
     }'
```

**3. Nutrition Tip:**
```bash
curl "http://127.0.0.1:8000/nutrition-tip?goal=muscle+gain"
```

**4. Admin View All Users:**
```bash
curl "http://127.0.0.1:8000/api/users"
```

---

## 📁 Project Directory Structure
```
fitbuddy/
├── requirements.txt            # Project dependencies
├── .env.example                # Environment variables template
├── test_api.py                 # Automated verification suite
├── app/
│   ├── main.py                 # FastAPI application entry & startup
│   ├── routes.py               # Route handlers (form POSTs & JSON APIs)
│   ├── database.py             # SQLAlchemy models (User, WorkoutPlan) & ORM
│   ├── schemas.py              # Pydantic validation schemas
│   ├── gemini_generator.py     # Gemini Pro workout plan generator
│   ├── gemini_flash_generator.py # Gemini Flash nutrition tip generator
│   ├── updated_plan.py         # Feedback-based workout plan updater
│   └── nutrition.py            # Macronutrient & nutrition helper
├── templates/
│   ├── index.html              # User input form page
│   ├── result.html             # Workout plan, tip & feedback submission page
│   └── all_users.html          # Coach / Admin table dashboard
├── static/
│   └── images/
│       └── gym-bg.svg          # Gym backdrop graphic
└── fitbuddy.db                 # Local SQLite database (created on first run)
```
