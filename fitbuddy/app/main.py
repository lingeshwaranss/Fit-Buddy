import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .routes import router
from .database import Base, engine, save_user, save_plan

app = FastAPI(
    title="FitBuddy – AI Fitness Plan Generator",
    description="FastAPI + Gemini AI 7-day personalized workout plan and nutrition tip generator",
    version="1.0.0"
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_DIR = os.path.dirname(BASE_DIR)
PUBLIC_DIR = os.path.join(PROJECT_DIR, "public")

app.mount("/static", StaticFiles(directory=PUBLIC_DIR), name="static")

# Include application routes
app.include_router(router)

@app.on_event("startup")
def on_startup():
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed default sample data if empty
    try:
        from .database import get_all_users
        if not get_all_users():
            demo_users = [
                (10, "xyz", 20, 70.0, "I want to lose belly fat and gain muscles", "High"),
                (1, "shreya", 22, 55.0, "muscle gain", "High"),
                (42, "Marcus Miller", 28, 82.5, "weight loss & functional stamina", "Medium"),
            ]
            sample_plan = "Day 1: Upper Body Strength\nDay 2: Lower Body & Core\nDay 3: Cardio\nDay 4: Active Recovery\nDay 5: Upper Pull\nDay 6: Lower Body\nDay 7: Rest"
            for user_id, name, age, weight, goal, intensity in demo_users:
                save_user(user_id, name, age, weight, goal, intensity)
                save_plan(
                    user_id=user_id,
                    plan=sample_plan,
                    nutrition_tip="Prioritize protein and stay hydrated to support training and recovery.",
                )
    except Exception as e:
        print(f"Startup seeding notice: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fitbuddy.app.main:app", host="127.0.0.1", port=8000, reload=True)
