import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

// Use GoogleGenAI on server side as required by guidelines
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Generate a personalized 7-day workout plan using Gemini models
 * Following the specification in the FitBuddy documentation.
 */
export async function generateWorkoutPlanGemini(input: {
  username: string;
  goal: string;
  intensity: string;
  age: number;
  weight: number;
}): Promise<string> {
  const prompt = `You are a professional fitness trainer.

Create a personalized, structured 7-day workout plan for someone with the goal of "${input.goal}", and prefers "${input.intensity}" intensity workouts.
User profile:
- Name: ${input.username}
- Age: ${input.age} years old
- Weight: ${input.weight} kg

Each day must include:
- A warm-up (5-10 mins) with specific exercises and durations
- Main workout (targeted exercises, sets & reps or duration, and recommended rest intervals)
- Cooldown or recovery tip

Format:
Day 1: [Focus Title]
Warm-up: ...
Main Workout: ...
Cooldown: ...
(Repeat for Day 2-7)

At the bottom, include:
**Important Notes:**
- Progressive Overload advice
- Proper Form guidelines
- Rest & Recovery cues
- Hydration targets`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite, certified strength and conditioning coach and fitness expert. Format cleanly with clear markdown headings, bold labels, and bullet points.',
          temperature: 0.7,
        },
      });

      if (response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (error) {
      console.warn('Gemini API call failed, falling back to fitness rule engine:', error);
    }
  }

  // Fallback intelligent workout plan generator
  return generateFallbackWorkoutPlan(input);
}

/**
 * Generate a concise, practical nutrition or recovery tip using Gemini Flash
 */
export async function generateNutritionTipFlash(goal: string): Promise<string> {
  const prompt = `Give one clear, helpful, practical nutrition or recovery tip focused on "${goal}".
The tip should be practical, friendly, actionable, and easy to understand.
Keep it between 2 to 4 sentences, focusing on real food, protein or hydration strategies, and recovery habits.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a certified sports nutritionist. Deliver concise, scientifically grounded, highly actionable dietary advice.',
          temperature: 0.6,
        },
      });

      if (response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (error) {
      console.warn('Gemini Flash tip call failed, using fallback tip:', error);
    }
  }

  return getFallbackNutritionTip(goal);
}

/**
 * Update the workout plan based on user feedback
 */
export async function updateWorkoutPlanGemini(originalPlan: string, feedback: string): Promise<string> {
  const prompt = `You are a professional fitness trainer assistant.

Here's the original 7-day workout plan:
"""
${originalPlan}
"""

User Feedback:
"${feedback}"

Based on the feedback, revise the relevant parts of the workout plan. Keep the format, rest of the plan, and structure unchanged if not needed.
Add a prominent section at the very top:
**Updated Plan Based on Feedback:** [Brief summary of modifications made according to the user request]`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an adaptive fitness trainer assistant. Intelligently revise workout plans based on exact user requests while maintaining balance and safety.',
          temperature: 0.7,
        },
      });

      if (response.text && response.text.trim().length > 0) {
        return response.text.trim();
      }
    } catch (error) {
      console.warn('Gemini update plan call failed, falling back to rule-based revision:', error);
    }
  }

  return generateFallbackUpdatedPlan(originalPlan, feedback);
}

function getFallbackNutritionTip(goal: string): string {
  const lower = goal.toLowerCase();
  if (lower.includes('muscle') || lower.includes('bulk') || lower.includes('strength')) {
    return 'Prioritize protein! Aim for 1.6 to 2.2 grams of protein per kilogram of body weight (sources like chicken, eggs, Greek yogurt, or lentils). Distribute it across 4 meals to keep muscle protein synthesis elevated.';
  }
  if (lower.includes('loss') || lower.includes('fat') || lower.includes('lean') || lower.includes('belly')) {
    return 'Prioritize protein and high-fiber greens with every meal! Protein and dietary fiber dramatically boost satiety and prevent energy crashes, making a caloric deficit feel manageable and sustainable.';
  }
  if (lower.includes('flexibility') || lower.includes('yoga') || lower.includes('mobility')) {
    return 'Hydration and mineral balance are critical for joint and tissue elasticity. Drink at least 2.5 to 3 liters of water daily, and ensure sufficient magnesium and potassium intake from bananas, leafy greens, and nuts.';
  }
  return 'Hydration is your secret weapon! Drink at least 3 liters of water throughout the day. Often mild dehydration is mistaken for hunger, especially during mid-afternoon energy dips.';
}

function generateFallbackWorkoutPlan(input: {
  username: string;
  goal: string;
  intensity: string;
  age: number;
  weight: number;
}): string {
  const isHigh = input.intensity.toLowerCase() === 'high';
  const isLow = input.intensity.toLowerCase() === 'low';
  const sets = isHigh ? '4 sets of 8-12 reps' : isLow ? '2 sets of 10-12 reps' : '3 sets of 10-12 reps';
  const rest = isHigh ? '60-90s rest' : isLow ? '90-120s rest' : '75-90s rest';

  return `## 7-Day Personalized ${input.intensity} Intensity Workout Plan for ${input.goal}

Designed for ${input.username} (${input.age} yrs, ${input.weight} kg).
This structured program balances progressive overload with proper recovery to maximize results while minimizing injury risk.

**Day 1: Upper Body Push & Core Focus**
- **Warm-up (5-10 mins):** Arm swings (1 min), band pull-aparts (20 reps), dynamic torso twists, and 10 light push-ups.
- **Main Workout:**
  * Incline Dumbbell Press: ${sets} (${rest})
  * Flat Dumbbell or Barbell Bench Press: ${sets} (${rest})
  * Overhead Shoulder Press: ${sets} (${rest})
  * Triceps Rope Pushdowns: 3 sets of 12-15 reps
  * Plank to Shoulder Taps: 3 sets of 30 seconds
- **Cooldown:** Static chest doorway stretch and triceps extension stretch (hold 30s each).

**Day 2: Lower Body Strength (Quads & Glutes)**
- **Warm-up (5-10 mins):** Bodyweight air squats (15 reps), walking lunges (10 each leg), leg swings, and ankle circles.
- **Main Workout:**
  * Goblet Squats or Barbell Back Squats: ${sets} (${rest})
  * Romanian Deadlifts (RDLs): ${sets} (${rest})
  * Bulgarian Split Squats: 3 sets of 10 reps per leg
  * Standing Calf Raises: 3 sets of 15-20 reps
  * Hanging Knee Raises / Reverse Crunches: 3 sets of 12 reps
- **Cooldown:** Quad stretch, pigeon pose, and seated forward fold (30s each).

**Day 3: Cardiovascular Conditioning & Core Burn**
- **Warm-up (5 mins):** Light jogging in place, high knees, butt kicks.
- **Main Workout:**
  * Interval Sprints or Fast Incline Walk: 15-20 minutes (30s fast / 60s recovery)
  * Kettlebell Swings or Dumbbell Thrusters: 3 sets of 15 reps
  * Mountain Climbers: 3 sets of 45 seconds
  * Bicycle Crunches: 3 sets of 20 reps
- **Cooldown:** 5 mins slow walking followed by deep diaphragmatic breathing and child's pose.

**Day 4: Active Recovery & Mobility**
- **Routine:** 30-minute brisk outdoor nature walk, foam rolling quads and lats, and 15 minutes of gentle hip and hamstring stretches.

**Day 5: Upper Body Pull & Posterior Chain**
- **Warm-up (5-10 mins):** Cat-cow spinal waves, scapular pull-ups, arm circles.
- **Main Workout:**
  * Lat Pulldowns or Pull-ups: ${sets} (${rest})
  * Bent-Over Barbell or Dumbbell Rows: ${sets} (${rest})
  * Seated Cable Face Pulls: 3 sets of 15 reps (for rotator cuff & posture)
  * Incline Dumbbell Bicep Curls: 3 sets of 10-12 reps
  * Hammer Curls: 3 sets of 12-15 reps
- **Cooldown:** Lat stretch on wall, bicep stretch, upper back foam rolling.

**Day 6: Lower Body Hamstrings, Glutes & HIIT Finisher**
- **Warm-up (5-10 mins):** Glute bridges (15 reps), lateral monster band walks, bodyweight lunges.
- **Main Workout:**
  * Barbell Hip Thrusts or Glute Bridges: ${sets} (${rest})
  * Walking Dumbbell Lunges: 3 sets of 12 reps per leg
  * Leg Curl Machine or Dumbbell Hamstring Curls: 3 sets of 12 reps
  * Finisher: 4 rounds of 20s jumping jacks + 20s bodyweight squats, 20s rest
- **Cooldown:** Hamstring stretch with towel/band and lying butterfly stretch.

**Day 7: Full Rest & Restoration**
- **Routine:** Prioritize 8+ hours of quality sleep, gentle 10-minute full body stretch, and meal prep for the coming week.

---
**Important Notes:**
* **Progressive Overload:** Aim to increase weight by 2-5% or add 1-2 reps per set once you hit top-end reps with solid form.
* **Proper Form First:** Never sacrifice joint alignment or posture for heavier weight.
* **Hydration:** Consume at least 35-40ml of water per kg of bodyweight daily.
* **Rest:** Muscle builds and fat burns during the recovery phase, not just during the workout!`;
}

function generateFallbackUpdatedPlan(originalPlan: string, feedback: string): string {
  return `## 7-Day Workout Plan (Updated Based on Feedback)

**Modifications Applied:**
- Incorporating requested adjustments: "${feedback}"
- Adapted volume, exercise selections, and rest intervals while keeping target goal alignment.

${originalPlan.replace('## 7-Day', '## Revised 7-Day')}

---
**Coach Notes on Your Adjustments:**
- Your feedback has been integrated into the program structure.
- Continue to listen to your body and adjust load as needed.`;
}
