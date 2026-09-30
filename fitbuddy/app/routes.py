import os
from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from pydantic import ValidationError

from .schemas import UserInput, WorkoutRequest, FeedbackRequest
from .gemini_generator import generate_workout_gemini
from .gemini_flash_generator import generate_nutrition_tip_with_flash
from .updated_plan import update_workout_plan
from .database import (
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
    return templates.TemplateResponse(request=request, name="index.html", context={})

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
        user = UserInput(
            user_id=user_id,
            username=username.strip(),
            age=age,
            weight=weight,
            goal=goal.strip(),
            intensity=intensity,
        )

        user_dict = user.model_dump()
        workout_plan = generate_workout_gemini(user_dict)
        nutrition_tip = generate_nutrition_tip_with_flash(goal)
        save_user(
            user_id=user.user_id,
            name=user.username,
            age=user.age,
            weight=user.weight,
            goal=user.goal,
            intensity=user.intensity,
        )
        save_plan(user_id=user.user_id, plan=workout_plan, nutrition_tip=nutrition_tip)

        return templates.TemplateResponse(request=request, name="result.html", context={
            "username": user.username,
            "user_id": user.user_id,
            "age": user.age,
            "weight": user.weight,
            "goal": user.goal,
            "intensity": user.intensity,
            "workout_plan": workout_plan,
            "nutrition_tip": nutrition_tip,
            "updated_success": False
        })
    except ValidationError as error:
        raise HTTPException(status_code=422, detail=error.errors())
    except HTTPException:
        raise
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
        user = get_user(user_id)
        workout_record = get_workout_plan(user_id)
        if not workout_record:
            raise HTTPException(status_code=404, detail="User original plan not found")
        if not feedback.strip():
            raise HTTPException(status_code=422, detail="Feedback text is required")

        base_plan = workout_record.updated_plan or workout_record.original_plan
        updated_plan_text = update_workout_plan(base_plan, feedback)
        tip = generate_nutrition_tip_with_flash(user.goal if user else "general fitness")
        update_plan(user_id, updated_plan_text, feedback, tip)

        return templates.TemplateResponse(request=request, name="result.html", context={
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
    except HTTPException:
        raise
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
                "updated_plan": plan.updated_plan if (plan and plan.updated_plan) else "Not updated",
            })

        return templates.TemplateResponse(request=request, name="all_users.html", context={
            "users": user_data
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading admin dashboard: {str(e)}")


@router.post("/delete-user/{user_id}")
def delete_user_html(user_id: int):
    if not delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return RedirectResponse(url="/view-all-users", status_code=303)

# --- JSON API Endpoints (as defined in Documentation) ---

def _serialize_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "age": user.age,
        "weight": user.weight,
        "goal": user.goal,
        "intensity": user.intensity,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def _serialize_plan(plan, created_at=None):
    if not plan:
        return None
    return {
        "user_id": plan.user_id,
        "original_plan": plan.original_plan,
        "updated_plan": plan.updated_plan,
        "nutrition_tip": plan.nutrition_tip or "",
        "last_feedback": plan.last_feedback,
        "updated_at": plan.updated_at.isoformat() if plan.updated_at else None,
        "created_at": created_at.isoformat() if created_at else None,
    }


@router.get("/api/health")
def health_check():
    return {"status": "ok", "service": "FitBuddy AI API"}


@router.post("/api/generate-plan")
async def generate_frontend_plan(request: Request):
    try:
        data = await request.json()
        raw_id = data.get("user_id", data.get("userId", data.get("id")))
        try:
            requested_id = int(raw_id)
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Enter a valid positive User ID.")
        if requested_id <= 0:
            raise HTTPException(status_code=400, detail="Enter a valid positive User ID.")

        name = str(data.get("name", data.get("username", "Fitness Enthusiast"))).strip()
        age = int(data.get("age") or 25)
        weight = float(data.get("weight") or 70.0)
        goal = str(data.get("goal", data.get("fitness_goal", "general fitness and fat loss"))).strip()
        intensity = str(data.get("intensity", "Medium"))
        if intensity not in {"Low", "Medium", "High"}:
            raise HTTPException(status_code=400, detail="Intensity must be Low, Medium, or High.")
        if not name or not 10 <= age <= 110 or not 20 <= weight <= 300 or not goal:
            raise HTTPException(status_code=400, detail="Enter valid profile details.")

        user_mode = "returning" if data.get("user_mode") == "returning" else "new"
        user = get_user(requested_id)
        notice = None
        user_id = requested_id
        previous_plan = get_workout_plan(requested_id) if user else None

        if user_mode == "returning":
            if not user:
                raise HTTPException(status_code=404, detail="No saved user has that ID. Choose New user to create a profile.")
            if user.name.strip().casefold() != name.casefold():
                raise HTTPException(status_code=409, detail="That User ID belongs to a different name. Check the ID and registered name, or choose New user.")
            if not previous_plan:
                raise HTTPException(status_code=404, detail="No saved workout plan exists for that user yet.")
            base_plan = previous_plan.updated_plan or previous_plan.original_plan
            prompt = (
                f"Refresh this returning user's existing 7-day plan using their current profile. "
                f"Preserve useful progress and keep the schedule safe and balanced. Current profile: "
                f"age {age}, weight {weight} kg, goal \"{goal}\", preferred intensity \"{intensity}\"."
            )
            workout_plan = update_workout_plan(base_plan, prompt)
        else:
            if user:
                users = get_all_users()
                user_id = max((item.id for item in users), default=0) + 1
                notice = f"User ID #{requested_id} is already in use. Your new profile was assigned ID #{user_id}."
            workout_plan = generate_workout_gemini({
                "username": name,
                "goal": goal,
                "intensity": intensity,
                "age": age,
                "weight": weight,
            })

        nutrition_tip = generate_nutrition_tip_with_flash(goal)
        save_user(user_id, name, age, weight, goal, intensity)
        if user_mode == "returning":
            update_plan(user_id, workout_plan, "Plan refreshed using the current profile.", nutrition_tip)
        else:
            save_plan(user_id, workout_plan, nutrition_tip)

        saved_user = get_user(user_id)
        saved_plan = get_workout_plan(user_id)
        return {
            "success": True,
            "message": "Your previous plan was reviewed and updated." if user_mode == "returning" else "Workout plan generated and saved successfully!",
            "notice": notice,
            "user": _serialize_user(saved_user),
            "plan": _serialize_plan(saved_plan, saved_user.created_at),
            "workout_plan": workout_plan,
            "nutrition_tip": nutrition_tip,
            "user_id": user_id,
            "username": name,
            "age": age,
            "weight": weight,
            "goal": goal,
            "intensity": intensity,
        }
    except HTTPException:
        raise
    except (TypeError, ValueError) as error:
        raise HTTPException(status_code=400, detail=f"Invalid profile data: {error}")
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to generate workout plan: {error}")


@router.post("/api/submit-feedback")
async def submit_frontend_feedback(request: Request):
    try:
        data = await request.json()
        user_id = int(data.get("user_id", data.get("userId", 0)))
        feedback = str(data.get("feedback", data.get("user_feedback", ""))).strip()
        if user_id <= 0:
            raise HTTPException(status_code=400, detail="User ID is required")
        if not feedback:
            raise HTTPException(status_code=400, detail="Feedback text is required")

        existing = get_workout_plan(user_id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Original plan not found for user ID: {user_id}")
        base_plan = existing.updated_plan or existing.original_plan
        updated = update_workout_plan(base_plan, feedback)
        update_plan(user_id, updated, feedback)
        saved = get_workout_plan(user_id)
        user = get_user(user_id)
        return {
            "success": True,
            "message": "Your plan has been updated based on your feedback!",
            "user_id": user_id,
            "updated_plan": updated,
            "plan": _serialize_plan(saved, user.created_at if user else None),
        }
    except HTTPException:
        raise
    except (TypeError, ValueError) as error:
        raise HTTPException(status_code=400, detail=f"Invalid feedback request: {error}")
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Failed to update plan with feedback: {error}")

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
@router.get("/api/nutrition-tip")
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
    merged = [
        {
            "id": u.id,
            "name": u.name,
            "age": u.age,
            "weight": u.weight,
            "goal": u.goal,
            "intensity": u.intensity,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "original_plan": plans[u.id].original_plan if u.id in plans else "N/A",
            "updated_plan": plans[u.id].updated_plan if u.id in plans else None,
            "nutrition_tip": (plans[u.id].nutrition_tip or "") if u.id in plans else "N/A",
            "last_feedback": plans[u.id].last_feedback if u.id in plans else None,
            "has_updated_plan": bool(plans[u.id].updated_plan) if u.id in plans else False,
        }
        for u in users
    ]
    return {"success": True, "count": len(merged), "users": merged}


@router.get("/api/users/{user_id}")
def get_user_api(user_id: int):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    plan = get_workout_plan(user_id)
    return {
        "success": True,
        "user": _serialize_user(user),
        "plan": _serialize_plan(plan, user.created_at),
    }

# API: Delete user
@router.delete("/api/users/{user_id}")
def delete_user_api(user_id: int):
    success = delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": f"User ID {user_id} deleted successfully"}


@router.post("/api/reset-demo")
def reset_demo_api():
    for user in get_all_users():
        delete_user(user.id)
    demo_users = [
        (10, "xyz", 20, 70.0, "I want to lose belly fat and gain muscles", "High"),
        (1, "shreya", 22, 55.0, "muscle gain", "High"),
        (42, "Marcus Miller", 28, 82.5, "weight loss & functional stamina", "Medium"),
    ]
    sample_plan = "## 7-Day Sample Workout Plan\n\nDay 1: Upper Body Strength\nDay 2: Lower Body & Core\nDay 3: Cardio\nDay 4: Active Recovery\nDay 5: Upper Pull\nDay 6: Lower Body\nDay 7: Rest"
    for user_id, name, age, weight, goal, intensity in demo_users:
        save_user(user_id, name, age, weight, goal, intensity)
        save_plan(user_id, sample_plan, "Prioritize protein and stay hydrated to support training and recovery.")
    return {"success": True, "message": "Database reset to demo state"}
