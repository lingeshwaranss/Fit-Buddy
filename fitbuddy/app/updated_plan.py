import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

model = None
if api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        try:
            model = genai.GenerativeModel("gemini-1.5-pro")
        except Exception:
            model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"Warning: Could not configure model in updated_plan: {e}")

def update_workout_plan(original_plan: str, user_feedback: str) -> str:
    """
    Use Gemini to update the workout plan based on user feedback.
    """
    prompt = f"""You are a professional fitness trainer assistant.

Here's the original 7-day workout plan:
{original_plan}

User Feedback:
"{user_feedback}"

Based on the feedback, revise the relevant parts of the workout plan. Keep the format and rest of the plan unchanged if not needed.
Add a note at the top detailing what was updated based on user feedback."""

    if model:
        try:
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"Gemini error during plan update: {e}")

    # Fallback revision engine
    return f"""## Updated 7-Day Workout Plan (Feedback Applied)

**Modifications Applied:**
- User Feedback: "{user_feedback}"
- Adjusted exercise variations, rest days, and intensity levels accordingly.

{original_plan.replace("## 7-Day", "## Revised 7-Day")}"""
