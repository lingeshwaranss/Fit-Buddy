import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

flash_model = None
if api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        flash_model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"Warning: Could not configure Gemini Flash: {e}")

def generate_nutrition_tip_with_flash(goal: str) -> str:
    """
    Generate a nutrition or recovery tip using Gemini Flash based on the user's fitness goal.
    """
    prompt = f"""Give one clear, helpful nutrition or recovery tip for someone focused on '{goal}'.
The tip should be practical, friendly, actionable, and easy to understand."""

    if flash_model:
        try:
            response = flash_model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"Gemini Flash tip generation error: {e}")

    # Fallback tips tailored to goals
    lower_goal = goal.lower()
    if "muscle" in lower_goal or "gain" in lower_goal:
        return "Prioritize protein! Aim for a good source of protein (like chicken, fish, beans, or Greek yogurt) with every meal. Protein helps build muscle, keeps you feeling full, and supports your metabolism, all crucial for achieving your ideal physique."
    elif "loss" in lower_goal or "fat" in lower_goal or "belly" in lower_goal:
        return "Focus on whole, nutrient-dense foods and stay hydrated! Drinking a glass of water before each meal and prioritizing high-fiber vegetables with lean protein helps you stay satiated in a moderate caloric deficit."
    elif "flexibility" in lower_goal or "yoga" in lower_goal:
        return "Keep your connective tissues hydrated! Drink at least 2.5 liters of water daily and include foods rich in omega-3 fatty acids (like salmon, chia seeds, and walnuts) to reduce inflammation and promote joint mobility."
    else:
        return "Consistency and sleep are your top nutrition enhancers! Aim for 7 to 9 hours of restorative sleep and replenish electrolytes post-workout to support continuous muscular recovery."
