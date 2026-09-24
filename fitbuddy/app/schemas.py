from pydantic import BaseModel, Field
from typing import Optional

class UserInput(BaseModel):
    user_id: int = Field(..., description="Unique User ID integer")
    username: str = Field(..., description="User's full name")
    age: int = Field(..., ge=10, le=120, description="Age in years")
    weight: float = Field(..., gt=20.0, description="Weight in kg")
    goal: str = Field(..., description="Fitness objective (e.g. weight loss, muscle gain)")
    intensity: str = Field(..., description="Workout intensity: Low, Medium, or High")

class WorkoutRequest(BaseModel):
    goal: str
    intensity: str

class FeedbackRequest(BaseModel):
    feedback: str
    user_id: Optional[int] = None

class NutritionResponse(BaseModel):
    goal: str
    nutrition_tip: str
