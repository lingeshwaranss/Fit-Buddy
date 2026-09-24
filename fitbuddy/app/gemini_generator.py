import os
from dotenv import load_dotenv

load_dotenv()

# Check for API key in environment
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

model = None
if api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        # Gemini 1.5 Pro or gemini-1.5-flash / gemini-2.0-flash / gemini-1.5-pro-latest
        try:
            model = genai.GenerativeModel("gemini-1.5-pro")
        except Exception:
            model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"Warning: Could not configure google.generativeai: {e}")

def generate_workout_gemini(user_input: dict) -> str:
    """
    Implements the core logic to generate a personalized 7-day workout plan
    using user inputs such as goal and intensity.
    """
    goal = user_input.get("goal", "general fitness")
    intensity = user_input.get("intensity", "Medium")
    username = user_input.get("username", user_input.get("name", "User"))
    age = user_input.get("age", 25)
    weight = user_input.get("weight", 70.0)

    prompt = f"""You are a professional fitness trainer.

Create a personalized, structured 7-day workout plan for {username} (Age: {age}, Weight: {weight}kg) with the goal of "{goal}", who prefers "{intensity}" intensity workouts.

Each day must include:
- A warm-up (5-10 mins)
- Main workout (targeted exercises, sets & reps)
- Cooldown or recovery tip

Format:
Day 1: [Focus Title]
Warm-up: ...
Main Workout: ...
Cooldown: ...
(Repeat for Day 2-7)

At the end include:
**Important Notes:**
- Progressive Overload advice
- Proper Form
- Recovery and Hydration
"""

    if model:
        try:
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"Gemini API error in workout generation: {e}")

    # Robust built-in fallback engine
    return f"""## 7-Day Personalized Workout Plan for {goal.title()} ({intensity} Intensity)

Prepared for: {username} | Age: {age} | Weight: {weight} kg

**Day 1: Upper Body Strength & Posture**
- **Warm-up (5-10 mins):** 1 min jumping jacks, 1 min arm circles, 15 band pull-aparts, 10 light push-ups.
- **Main Workout:**
  * Flat Bench Press / Dumbbell Press: 3 sets of 8-12 reps
  * Bent-Over Rows: 3 sets of 8-12 reps
  * Overhead Shoulder Press: 3 sets of 10 reps
  * Triceps Pushdowns: 3 sets of 12 reps
  * Bicep Curls: 3 sets of 12 reps
- **Cooldown:** 5 mins static stretching for chest, lats, and shoulders.

**Day 2: Lower Body Power & Core**
- **Warm-up (5-10 mins):** 15 bodyweight squats, 10 lunges per leg, glute bridges.
- **Main Workout:**
  * Barbell or Goblet Squats: 3 sets of 8-12 reps
  * Romanian Deadlifts: 3 sets of 10-12 reps
  * Walking Lunges: 3 sets of 12 steps per leg
  * Hanging Knee Raises: 3 sets of 12 reps
  * Plank: 3 sets of 45 seconds
- **Cooldown:** Hamstrings, quads, and hip flexors foam rolling and stretches.

**Day 3: HIIT Cardio & Core Blast**
- **Warm-up (5 mins):** High knees, light jog, torso twists.
- **Main Workout:**
  * Kettlebell Swings: 3 sets of 20 reps
  * Burpees: 3 sets of 12 reps
  * Mountain Climbers: 3 sets of 45 seconds
  * Bicycle Crunches: 3 sets of 20 reps per side
- **Cooldown:** Slow walking and deep diaphragmatic breathing.

**Day 4: Active Recovery & Mobility**
- **Routine:** 30-40 min outdoor walk, foam rolling, and gentle yoga stretches for hips and spine.

**Day 5: Upper Body Hypertrophy & Pull**
- **Warm-up (5-10 mins):** Scapular retractions, cat-cow stretch, arm circles.
- **Main Workout:**
  * Lat Pulldowns or Pull-ups: 3 sets of 8-12 reps
  * Seated Cable Rows: 3 sets of 10-12 reps
  * Incline Dumbbell Press: 3 sets of 10 reps
  * Lateral Raises: 3 sets of 15 reps
  * Hammer Curls: 3 sets of 12 reps
- **Cooldown:** Doorway pec stretch and upper back reach.

**Day 6: Lower Body Glutes, Hamstrings & Calves**
- **Warm-up (5-10 mins):** Monster walks with band, bodyweight hip hinge.
- **Main Workout:**
  * Barbell Hip Thrusts: 3 sets of 12 reps
  * Bulgarian Split Squats: 3 sets of 10 reps per leg
  * Leg Curls: 3 sets of 12 reps
  * Standing Calf Raises: 3 sets of 20 reps
- **Cooldown:** Butterfly stretch and pigeon pose.

**Day 7: Full Rest & Restoration**
- **Routine:** 8+ hours quality sleep, hydration, and mental de-stressing.

---
**Important Notes:**
* **Progressive Overload:** Increase weights or reps gradually week after week.
* **Proper Form:** Keep movements controlled; avoid using momentum.
* **Hydration:** Aim for 3-4 liters of water throughout active days."""
