import os
from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates

from app.schemas import UserInput, WorkoutRequest, FeedbackRequest
from app.gemini_generator import generate_workout_gemini
from app.gemini_flash_generator import generate_nutrition_tip_with_flash
from app.updated_plan import update_workout_plan
from app.database import (
    save_user,
    save_plan,
    update_plan,
    get_original_plan,
    get_workout_plan,
    get_user,
    get_all_users,
    get_all_plans,
    delete_user
)

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
templates = Jinja2Templates(directory=TEMPLATE_DIR)

# 1. Home Route
@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# 2. Plan Generator (Form Submission)
@router.post("/generate-workout", response_class=HTMLResponse)
async def generate_workout_html(
    request: Request,
    username: str = Form(..., alias="name"),
    user_id: int = Form(...),
    age: int = Form(...),
    weight: float = Form(...),
    goal: str = Form(...),
    intensity: str = Form(...)
):
    try:
        user_dict = {
            "username": username,
            "user_id": user_id,
            "age": age,
            "weight": weight,
            "goal": goal,
            "intensity": intensity
        }

        # 1. Save User to DB
        save_user(
            user_id=user_id,
            name=username,
            age=age,
            weight=weight,
            goal=goal,
            intensity=intensity
        )

        # 2. Call Gemini Pro to generate 7-day workout plan
        workout_plan = generate_workout_gemini(user_dict)

        # 3. Call Gemini Flash to generate nutrition tip
        nutrition_tip = generate_nutrition_tip_with_flash(goal)

        # 4. Save Plan to DB
        save_plan(user_id=user_id, plan=workout_plan, nutrition_tip=nutrition_tip)

        return templates.TemplateResponse("result.html", {
            "request": request,
            "username": username,
            "user_id": user_id,
            "age": age,
            "weight": weight,
            "goal": goal,
            "intensity": intensity,
            "workout_plan": workout_plan,
            "nutrition_tip": nutrition_tip,
            "updated_success": False
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate workout plan: {str(e)}")

# 3. Update Plan with Feedback (Form Submission)
@router.post("/submit-feedback", response_class=HTMLResponse)
async def submit_feedback_html(
    request: Request,
    user_id: int = Form(...),
    feedback: str = Form(...)
):
    try:
        original = get_original_plan(user_id)
        if not original:
            raise HTTPException(status_code=404, detail="User original plan not found")

        user = get_user(user_id)
        workout_record = get_workout_plan(user_id)

        # Generate updated workout plan via Gemini
        base_plan = workout_record.updated_plan if (workout_record and workout_record.updated_plan) else original
        updated_plan_text = update_workout_plan(base_plan, feedback)

        # Update in database
        update_plan(user_id, updated_plan_text, feedback)

        # Fresh nutrition tip or current tip
        tip = workout_record.nutrition_tip if workout_record else generate_nutrition_tip_with_flash(user.goal if user else "general fitness")

        return templates.TemplateResponse("result.html", {
            "request": request,
            "username": user.name if user else "User",
            "user_id": user_id,
            "age": user.age if user else 25,
            "weight": user.weight if user else 70.0,
            "goal": user.goal if user else "Fitness",
            "intensity": user.intensity if user else "Medium",
            "workout_plan": updated_plan_text,
            "nutrition_tip": tip,
            "updated_success": True
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback update failed: {str(e)}")

# 4. Admin View of All Users
@router.get("/view-all-users", response_class=HTMLResponse)
async def view_all_users_html(request: Request):
    try:
        users = get_all_users()
        plans = get_all_plans()

        plan_map = {p.user_id: p for p in plans}
        user_data = []

        for user in users:
            plan = plan_map.get(user.id)
            user_data.append({
                "id": user.id,
                "name": user.name,
                "age": user.age,
                "weight": user.weight,
                "goal": user.goal,
                "intensity": user.intensity,
                "original_plan": plan.original_plan if plan else "N/A",
                "updated_plan": plan.updated_plan if (plan and plan.updated_plan) else "Not updated"
            })

        return templates.TemplateResponse("all_users.html", {
            "request": request,
            "users": user_data
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading admin dashboard: {str(e)}")

# --- JSON API Endpoints (as defined in Documentation) ---

# API 1: Generate workout using Gemini Pro
@router.post("/generate-workout/gemini")
async def generate_gemini_workout(request: WorkoutRequest):
    try:
        result = generate_workout_gemini({
            "goal": request.goal,
            "intensity": request.intensity
        })
        return {"model": "gemini-pro", "workout_plan": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API 2: Generate nutrition tip using Gemini Flash
@router.get("/nutrition-tip")
def get_flash_tip(goal: str):
    try:
        tip = generate_nutrition_tip_with_flash(goal)
        return {"goal": goal, "nutrition_tip": tip}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API 3: Save user info & generate plan
@router.post("/generate-plan")
def generate_plan_api(user_data: UserInput):
    try:
        save_user(
            user_id=user_data.user_id,
            name=user_data.username,
            age=user_data.age,
            weight=user_data.weight,
            goal=user_data.goal,
            intensity=user_data.intensity
        )

        plan = generate_workout_gemini({
            "goal": user_data.goal,
            "intensity": user_data.intensity,
            "username": user_data.username,
            "age": user_data.age,
            "weight": user_data.weight
        })

        tip = generate_nutrition_tip_with_flash(user_data.goal)
        save_plan(user_data.user_id, plan, tip)

        return {
            "message": "Workout plan generated and saved successfully!",
            "workout_plan": plan,
            "nutrition_tip": tip
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong: {str(e)}")

# API 4: Update workout plan based on user feedback
@router.post("/update-plan/{user_id}")
def update_user_plan_api(user_id: int, data: FeedbackRequest):
    try:
        original = get_original_plan(user_id)
        if not original:
            return {"error": "Original plan not found for this user."}

        workout_record = get_workout_plan(user_id)
        base = workout_record.updated_plan if (workout_record and workout_record.updated_plan) else original
        updated = update_workout_plan(base, data.feedback)
        update_plan(user_id, updated, data.feedback)
        return {"updated_plan": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API: Admin Get All Users (JSON)
@router.get("/api/users")
def get_users_api():
    users = get_all_users()
    plans = {p.user_id: p for p in get_all_plans()}
    return [
        {
            "id": u.id,
            "name": u.name,
            "age": u.age,
            "weight": u.weight,
            "goal": u.goal,
            "intensity": u.intensity,
            "original_plan": plans[u.id].original_plan if u.id in plans else None,
            "updated_plan": plans[u.id].updated_plan if u.id in plans else None,
        }
        for u in users
    ]

# API: Delete user
@router.delete("/api/users/{user_id}")
def delete_user_api(user_id: int):
    success = delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} deleted successfully"}
