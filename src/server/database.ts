import fs from 'fs';
import path from 'path';

export interface User {
  id: number;
  name: string;
  age: number;
  weight: number;
  goal: string;
  intensity: 'Low' | 'Medium' | 'High';
  created_at: string;
}

export interface WorkoutPlan {
  user_id: number;
  original_plan: string;
  updated_plan: string | null;
  nutrition_tip: string;
  last_feedback?: string | null;
  updated_at?: string;
  created_at: string;
}

export interface DatabaseState {
  users: User[];
  plans: WorkoutPlan[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'fitbuddy_db.json');

const INITIAL_DATA: DatabaseState = {
  users: [
    {
      id: 10,
      name: "xyz",
      age: 20,
      weight: 70.0,
      goal: "I want to lose belly fat and gain muscles",
      intensity: "High",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 1,
      name: "shreya",
      age: 22,
      weight: 55.0,
      goal: "muscle gain",
      intensity: "High",
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 42,
      name: "Marcus Miller",
      age: 28,
      weight: 82.5,
      goal: "weight loss & functional stamina",
      intensity: "Medium",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ],
  plans: [
    {
      user_id: 10,
      original_plan: `## 7-Day High-Intensity Workout Plan for Fat Loss & Muscle Gain

This plan focuses on compound exercises to maximize calorie burn and muscle engagement. Remember to adjust the intensity based on your fitness level and consult a doctor before starting any new workout routine. Proper nutrition is crucial for achieving your goals, so ensure you're supporting your training with a healthy diet.

**Day 1: Upper Body Strength**
- **Warm-up (5 mins):** Jumping jacks (60 seconds), high knees (30 seconds), arm circles (forward and backward, 30 seconds each), dynamic stretches like arm swings and torso twists (1 min).
- **Main Workout:**
  * Barbell Bench Press: 3 sets of 8-12 reps
  * Pull-ups (or Lat Pulldowns): 3 sets of 8-12 reps
  * Overhead Press: 3 sets of 8-12 reps
  * Barbell Rows: 3 sets of 8-12 reps
  * Dumbbell Bicep Curls: 3 sets of 10-15 reps
  * Dumbbell Triceps Extensions: 3 sets of 10-15 reps
- **Cooldown:** Static stretches holding each for 30 seconds (chest, back, biceps, triceps, shoulders).

**Day 2: Lower Body & Core**
- **Warm-up (5 mins):** Bodyweight squats (15 reps), lunges (10 reps per leg), glute bridges (15 reps), plank (30 seconds).
- **Main Workout:**
  * Barbell Squats: 3 sets of 8-12 reps
  * Romanian Deadlifts: 3 sets of 10-15 reps
  * Walking Lunges: 3 sets of 12-15 reps per leg
  * Glute Bridges: 3 sets of 15-20 reps
  * Hanging Leg Raises: 3 sets to failure
  * Russian Twists: 3 sets of 15-20 reps per side
- **Cooldown:** Foam roll quads, hamstrings, and glutes. Static stretches for hip flexors, hamstrings, and glutes (30 seconds each).

**Day 3: HIIT Cardio & Core**
- **Warm-up (5 mins):** Light cardio, like jogging or jumping jacks, followed by dynamic stretches.
- **Main Workout:**
  * Burpees: 3 sets of 10-15 reps
  * Mountain Climbers: 3 sets of 30-60 seconds
  * Kettlebell Swings: 3 sets of 15-20 reps
  * Plank variations (high plank, forearm plank, side plank): 30-60 seconds each, repeat 2-3 times
- **Cooldown:** Light cardio cool down (5 mins), static stretches for core and legs.

**Day 4: Rest or Active Recovery**
- **Active Recovery:** Light activity like walking, swimming, yoga, or foam rolling. Focus on mobility and flexibility. This helps promote blood flow and reduces muscle soreness.

**Day 5: Upper Body Strength (Focus on different exercises)**
- **Warm-up (5 mins):** Similar to Day 1.
- **Main Workout:**
  * Incline Dumbbell Press: 3 sets of 8-12 reps
  * Chin-ups (or Close-Grip Lat Pulldowns): 3 sets of 8-12 reps
  * Arnold Press: 3 sets of 8-12 reps
  * T-Bar Rows: 3 sets of 8-12 reps
  * Hammer Curls: 3 sets of 10-15 reps
  * Overhead Triceps Extensions: 3 sets of 10-15 reps
- **Cooldown:** Similar to Day 1.

**Day 6: Lower Body & Core (Focus on different exercises)**
- **Warm-up (5 mins):** Similar to Day 2.
- **Main Workout:**
  * Front Squats: 3 sets of 8-12 reps
  * Good Mornings: 3 sets of 10-15 reps
  * Bulgarian Split Squats: 3 sets of 10-12 reps per leg
  * Hip Thrusts: 3 sets of 15-20 reps
  * Cable Crunches: 3 sets to failure
  * Wood Chops (Cable machine): 3 sets of 15-20 reps per side
- **Cooldown:** Similar to Day 2.

**Day 7: Rest or Active Recovery**
- **Active Recovery:** Similar to Day 4. Prioritize getting enough sleep this day to prepare for the next week of training.

---
**Important Notes:**
* **Progressive Overload:** Gradually increase the weight, reps, or sets each week to challenge your muscles and promote continued growth.
* **Proper Form:** Focus on maintaining correct form throughout each exercise to prevent injury and maximize results.
* **Listen to Your Body:** Rest when needed and don't push through pain.
* **Hydration:** Drink plenty of water throughout the day, especially before, during, and after workouts.`,
      updated_plan: `## 7-Day High-Intensity Workout Plan (Updated with Yoga & Mobility Focus)

**Feedback Applied:** Incorporated restorative Vinyasa yoga sessions on recovery days and added dedicated hamstring/hip mobility drills after lower body days.

**Day 1: Upper Body Strength & Posture**
- **Warm-up (5 mins):** Jumping jacks (60 seconds), arm circles, band pull-aparts.
- **Main Workout:**
  * Barbell Bench Press: 3 sets of 8-12 reps
  * Pull-ups: 3 sets of 8-12 reps
  * Overhead Press: 3 sets of 8-12 reps
  * Barbell Rows: 3 sets of 8-12 reps
  * Dumbbell Bicep Curls: 3 sets of 10-15 reps
- **Cooldown:** 5 mins of chest and upper spine stretches.

**Day 2: Lower Body & Deep Core**
- **Warm-up (5 mins):** Bodyweight squats, dynamic lunges, glute bridges.
- **Main Workout:**
  * Barbell Squats: 3 sets of 8-12 reps
  * Romanian Deadlifts: 3 sets of 10-15 reps
  * Bulgarian Split Squats: 3 sets of 10-12 reps per leg
  * Russian Twists: 3 sets of 20 reps
- **Cooldown & Yoga:** Pigeon pose, downward dog, and butterfly stretch (10 mins).

**Day 3: HIIT Cardio & Core Flow**
- **Warm-up (5 mins):** Light jog & dynamic torso twists.
- **Main Workout:**
  * Kettlebell Swings: 4 sets of 20 reps
  * Burpees: 3 sets of 12 reps
  * Mountain Climbers: 3 sets of 45 seconds
  * High-Plank to Downward-Dog flow: 3 sets of 12 reps
- **Cooldown:** Child's pose and deep diaphragmatic breathing.

**Day 4: Restorative Yoga & Active Recovery**
- **Routine:** 30-minute full body Vinyasa Flow focusing on spinal mobility, hip openers, and hamstring length.

**Day 5: Upper Body Hypertrophy**
- **Warm-up (5 mins):** Band dislocates, scapular pushups.
- **Main Workout:**
  * Incline Dumbbell Press: 3 sets of 10-12 reps
  * Close-Grip Lat Pulldowns: 3 sets of 10-12 reps
  * Arnold Press: 3 sets of 10-12 reps
  * Face Pulls: 3 sets of 15 reps
- **Cooldown:** Thoracic extension and doorway chest stretch.

**Day 6: Lower Body Power & Core**
- **Warm-up (5 mins):** Leg swings, bodyweight squats.
- **Main Workout:**
  * Goblet Squats: 3 sets of 12 reps
  * Hip Thrusts: 3 sets of 15 reps
  * Walking Lunges: 3 sets of 12 reps per leg
  * Cable Crunches: 3 sets of 15 reps
- **Cooldown & Yoga:** 10 mins lizard pose, cobra pose, and hamstring fold.

**Day 7: Full Recovery & Rest**
- **Routine:** Gentle walk and 15 mins guided meditation & breathwork.`,
      nutrition_tip: "Prioritize protein! Aim for a good source of protein (like chicken, fish, beans, or Greek yogurt) with every meal. Protein helps build muscle, keeps you feeling full, and supports your metabolism, all crucial for losing belly fat and gaining muscle.",
      last_feedback: "Add yoga sessions on rest days and extra hip mobility after lower body days.",
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      user_id: 1,
      original_plan: `## 7-Day Muscle Gain Workout Plan (Medium Intensity)

This plan focuses on compound exercises to maximize muscle growth and utilizes a push-pull-legs split with rest days strategically placed for optimal recovery.

**Day 1: Upper Body Push**
- **Warm-up (5-10 mins):** Arm circles (forward and backward, 1 min each), Shoulder rotations (1 min), Push-ups (as many reps as possible in 1 min), Light bench press (empty bar, 1 set of 10-12 reps).
- **Main Workout:**
  * Bench Press: 3 sets of 8-12 reps
  * Incline Dumbbell Press: 3 sets of 8-12 reps
  * Overhead Press: 3 sets of 8-12 reps
  * Triceps Pushdowns: 3 sets of 10-15 reps
  * Lateral Raises: 3 sets of 12-15 reps
- **Cooldown:** Static stretching focusing on chest, shoulders, and triceps (hold each stretch for 30 seconds).

**Day 2: Lower Body (Legs & Core)**
- **Warm-up (5-10 mins):** Bodyweight squats (10-12 reps), Glute bridges (10-12 reps), Plank (30 seconds).
- **Main Workout:**
  * Barbell Squats: 3 sets of 8-12 reps
  * Romanian Deadlifts: 3 sets of 10-12 reps
  * Leg Press: 3 sets of 10-15 reps
  * Standing Calf Raises: 3 sets of 15-20 reps
  * Hanging Knee Raises: 3 sets of 12-15 reps
- **Cooldown:** Quadriceps, hamstrings, and calf stretches.

**Day 3: Active Rest / Recovery**
- Light 20 min walk and mobility foam rolling.

**Day 4: Upper Body Pull**
- **Warm-up (5-10 mins):** Band pull-aparts, light lat pulldowns.
- **Main Workout:**
  * Barbell Bent-Over Rows: 3 sets of 8-12 reps
  * Lat Pulldowns: 3 sets of 10-12 reps
  * Seated Cable Rows: 3 sets of 10-12 reps
  * Barbell Bicep Curls: 3 sets of 10-12 reps
  * Hammer Curls: 3 sets of 12-15 reps
- **Cooldown:** Back and bicep static stretches.

**Day 5: Full Body Pump**
- **Main Workout:** Dumbbell thrusters, chin-ups, dumbbell lunges, push-ups.

**Day 6 & 7: Rest and Muscle Growth Recovery**
- Sleep 8+ hours and maintain positive calorie & protein balance.`,
      updated_plan: `## 7-Day Muscle Gain Workout Plan (Updated: Home Friendly / Dumbbells)

**Day 1: Upper Body Push (Dumbbell Focus)**
- Warm-up: Arm swings, wall push-ups, light shoulder circles.
- Dumbbell Floor Press: 4 sets of 10-12 reps
- Standing Dumbbell Shoulder Press: 3 sets of 10-12 reps
- Dumbbell Diamond Push-ups: 3 sets to failure
- Dumbbell Lateral Raises: 3 sets of 15 reps

**Day 2: Lower Body Legs & Calves**
- Goblet Squats: 4 sets of 12 reps
- Dumbbell Romanian Deadlifts: 3 sets of 12 reps
- Walking Lunges: 3 sets of 14 steps
- Calf Raises holding dumbbells: 4 sets of 20 reps

**Day 3: Active Rest & Recovery Walk**

**Day 4: Upper Body Pull**
- Dumbbell Rows: 4 sets of 10-12 reps per arm
- Dumbbell Pullovers: 3 sets of 12 reps
- Incline Dumbbell Curls: 3 sets of 12 reps
- Hammer Curls: 3 sets of 12 reps

**Day 5: Core & High Rep Conditioning**
- Planks, Russian twists, Dumbbell farmers carry.

**Day 6 & 7: Rest & Repair**`,
      nutrition_tip: "Eat in a slight caloric surplus with 1.6 to 2.2 grams of protein per kilogram of body weight. Distribute your protein across 4 to 5 meals daily to continuously stimulate muscle protein synthesis.",
      last_feedback: "Please adjust for dumbbell-only home workout.",
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      user_id: 42,
      original_plan: `## 7-Day Stamina & Weight Loss Foundation Plan (Medium Intensity)

**Day 1: Cardio Intervals & Core Activation**
- Warm-up: 5 mins brisk march & knee hugs
- Main: 20 min interval treadmill/walk-jog (1 min jog, 2 mins brisk walk), followed by 3 sets of planks and bicycle crunches.
- Cooldown: Calves, hamstrings, and hip flexor stretches.

**Day 2: Full Body Resistance Circuit**
- Goblet Squats: 3 sets of 12 reps
- Push-ups (knees or standard): 3 sets of 10 reps
- Dumbbell Rows: 3 sets of 12 reps
- Glute Bridges: 3 sets of 15 reps

**Day 3: Low-Impact Aerobic Endurance**
- 35-minute outdoor walk, stationary bike, or swimming at steady conversation pace.

**Day 4: Core & Mobility**
- Cat-cow stretches, bird-dogs, dead-bugs, side planks.

**Day 5: Bodyweight Metabolic Conditioning**
- 4 rounds: 15 air squats, 10 pushups, 20 high knees, 30s rest.

**Day 6: Outdoor Fun Cardio**
- Hiking, cycling, or recreational sports.

**Day 7: Full Rest & Recharge**`,
      updated_plan: null,
      nutrition_tip: "Hydration is your secret weapon! Drink at least 3 liters of water daily. Often mild dehydration is mistaken for hunger, especially during mid-afternoon energy dips.",
      last_feedback: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ]
};

function ensureDbFile(): DatabaseState {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.users || !parsed.plans) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB, falling back to memory copy:', err);
    return INITIAL_DATA;
  }
}

function saveDbFile(state: DatabaseState): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

export const db = {
  getUsers(): User[] {
    const data = ensureDbFile();
    return data.users;
  },

  getUser(id: number): User | undefined {
    const data = ensureDbFile();
    return data.users.find(u => u.id === id);
  },

  getPlans(): WorkoutPlan[] {
    const data = ensureDbFile();
    return data.plans;
  },

  getPlan(userId: number): WorkoutPlan | undefined {
    const data = ensureDbFile();
    return data.plans.find(p => p.user_id === userId);
  },

  getNextUserId(): number {
    const data = ensureDbFile();
    const ids = [...data.users.map(user => user.id), ...data.plans.map(plan => plan.user_id)];
    return Math.max(0, ...ids) + 1;
  },

  saveUser(user: { id: number; name: string; age: number; weight: number; goal: string; intensity: 'Low' | 'Medium' | 'High' }): User {
    const data = ensureDbFile();
    const existingIndex = data.users.findIndex(u => u.id === user.id);
    const updatedUser: User = {
      ...user,
      created_at: existingIndex >= 0 ? data.users[existingIndex].created_at : new Date().toISOString()
    };

    if (existingIndex >= 0) {
      data.users[existingIndex] = updatedUser;
    } else {
      data.users.unshift(updatedUser);
    }
    saveDbFile(data);
    return updatedUser;
  },

  savePlan(userId: number, originalPlan: string, nutritionTip: string): WorkoutPlan {
    const data = ensureDbFile();
    const existingIndex = data.plans.findIndex(p => p.user_id === userId);
    const newPlan: WorkoutPlan = {
      user_id: userId,
      original_plan: originalPlan,
      updated_plan: null,
      nutrition_tip: nutritionTip,
      created_at: existingIndex >= 0 ? data.plans[existingIndex].created_at : new Date().toISOString()
    };

    if (existingIndex >= 0) {
      data.plans[existingIndex] = newPlan;
    } else {
      data.plans.unshift(newPlan);
    }
    saveDbFile(data);
    return newPlan;
  },

  updatePlan(userId: number, updatedPlanText: string, feedback: string, nutritionTip?: string): WorkoutPlan | null {
    const data = ensureDbFile();
    const plan = data.plans.find(p => p.user_id === userId);
    if (!plan) return null;

    plan.updated_plan = updatedPlanText;
    plan.last_feedback = feedback;
    plan.updated_at = new Date().toISOString();
    if (nutritionTip) plan.nutrition_tip = nutritionTip;

    saveDbFile(data);
    return plan;
  },

  deleteUser(userId: number): boolean {
    const data = ensureDbFile();
    const initialUsersCount = data.users.length;
    data.users = data.users.filter(u => u.id !== userId);
    data.plans = data.plans.filter(p => p.user_id !== userId);

    if (data.users.length !== initialUsersCount) {
      saveDbFile(data);
      return true;
    }
    return false;
  },

  resetToDemo(): DatabaseState {
    saveDbFile(INITIAL_DATA);
    return INITIAL_DATA;
  }
};
