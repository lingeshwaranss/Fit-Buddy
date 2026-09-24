import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import router
from app.database import Base, engine, save_user, save_plan

app = FastAPI(
    title="FitBuddy – AI Fitness Plan Generator",
    description="FastAPI + Gemini AI 7-day personalized workout plan and nutrition tip generator",
    version="1.0.0"
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Ensure static and images directory exist
os.makedirs(os.path.join(STATIC_DIR, "images"), exist_ok=True)

# Mount static folder
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include application routes
app.include_router(router)

@app.on_event("startup")
def on_startup():
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed default sample data if empty
    try:
        from app.database import get_all_users
        if not get_all_users():
            save_user(
                user_id=10,
                name="xyz",
                age=20,
                weight=70.0,
                goal="I want to lose belly fat and gain muscles",
                intensity="High"
            )
            save_plan(
                user_id=10,
                plan="Day 1: Upper Body Strength\n- Warm-up: 5 mins jumping jacks\n- Bench Press: 3 sets of 10 reps\nDay 2: Lower Body & Core\n- Squats: 3 sets of 10 reps\nDay 3: HIIT Cardio\nDay 4: Active Recovery\nDay 5: Upper Pull\nDay 6: Lower Leg Power\nDay 7: Rest & Repair",
                nutrition_tip="Prioritize protein! Aim for chicken, fish, beans, or Greek yogurt with every meal."
            )
    except Exception as e:
        print(f"Startup seeding notice: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
