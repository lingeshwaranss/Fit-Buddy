import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './src/server/database.ts';
import {
  generateWorkoutPlanGemini,
  generateNutritionTipFlash,
  updateWorkoutPlanGemini,
} from './src/server/geminiService.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'FitBuddy AI API' });
});

// API #1 & #3: Generate Workout Plan & Nutrition Tip and Save User
// Handles both /api/generate-plan and /generate-workout
async function handleGeneratePlan(req: Request, res: Response): Promise<void> {
  try {
    const rawId = req.body.user_id ?? req.body.userId ?? req.body.id;
    const requestedUserId = Number(rawId);
    const username = (req.body.name ?? req.body.username ?? 'Fitness Enthusiast').toString().trim();
    const age = Number(req.body.age) || 25;
    const weight = Number(req.body.weight) || 70.0;
    const goal = (req.body.goal ?? req.body.fitness_goal ?? 'general fitness and fat loss').toString().trim();
    const intensity = (req.body.intensity ?? 'Medium') as 'Low' | 'Medium' | 'High';
    const userMode = req.body.user_mode === 'returning' ? 'returning' : 'new';

    if (!Number.isSafeInteger(requestedUserId) || requestedUserId <= 0) {
      res.status(400).json({ success: false, error: 'Enter a valid positive User ID.' });
      return;
    }

    let userId = requestedUserId;
    let notice: string | undefined;
    let previousPlan;
    const existingUser = db.getUser(requestedUserId);

    if (userMode === 'returning') {
      if (!existingUser) {
        res.status(404).json({ success: false, error: 'No saved user has that ID. Choose New user to create a profile.' });
        return;
      }
      if (existingUser.name.trim().toLocaleLowerCase() !== username.toLocaleLowerCase()) {
        res.status(409).json({ success: false, error: 'That User ID belongs to a different name. Check the ID and registered name, or choose New user.' });
        return;
      }
      previousPlan = db.getPlan(requestedUserId);
      if (!previousPlan) {
        res.status(404).json({ success: false, error: 'No saved workout plan exists for that user yet.' });
        return;
      }
    } else if (existingUser) {
      userId = db.getNextUserId();
      notice = `User ID #${requestedUserId} is already in use. Your new profile was assigned ID #${userId}.`;
    }

    const workoutPlan = userMode === 'returning' && previousPlan
      ? await updateWorkoutPlanGemini(
          previousPlan.updated_plan || previousPlan.original_plan,
          `Refresh this returning user's existing 7-day plan using their current profile. Preserve useful progress, review the previous plan before changing it, and keep the schedule safe and balanced. Current profile: age ${age}, weight ${weight} kg, goal "${goal}", preferred intensity "${intensity}". Adapt the existing plan to these details.`,
        )
      : await generateWorkoutPlanGemini({ username, goal, intensity, age, weight });

    const nutritionTip = await generateNutritionTipFlash(goal);

    if (userMode === 'new' && db.getUser(userId)) {
      userId = db.getNextUserId();
      notice = `The requested ID was just taken. Your new profile was assigned ID #${userId}.`;
    }

    const savedUser = db.saveUser({
      id: userId,
      name: username,
      age,
      weight,
      goal,
      intensity,
    });

    const savedPlan = userMode === 'returning'
      ? db.updatePlan(
          userId,
          workoutPlan,
          `Plan refreshed from the previous plan using the current profile: ${goal} (${intensity} intensity).`,
          nutritionTip,
        )
      : db.savePlan(userId, workoutPlan, nutritionTip);

    if (!savedPlan) {
      res.status(404).json({ success: false, error: 'The saved plan could not be updated. Reload the user and try again.' });
      return;
    }

    res.json({
      success: true,
      message: userMode === 'returning' ? 'Your previous plan was reviewed and updated.' : 'Workout plan generated and saved successfully!',
      notice,
      user: savedUser,
      plan: savedPlan,
      workout_plan: workoutPlan,
      nutrition_tip: nutritionTip,
      user_id: userId,
      username,
      age,
      weight,
      goal,
      intensity,
    });
  } catch (error: any) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate workout plan',
      detail: error?.message || String(error),
    });
  }
}

app.post('/api/generate-plan', handleGeneratePlan);
app.post('/generate-workout', handleGeneratePlan);

// API #2: Generate Nutrition Tip only
app.get('/api/nutrition-tip', async (req: Request, res: Response): Promise<void> => {
  try {
    const goal = (req.query.goal as string) || 'general fitness';
    const tip = await generateNutritionTipFlash(goal);
    res.json({ goal, nutrition_tip: tip });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate nutrition tip', detail: error?.message });
  }
});

// API #4: Submit Feedback & Update Workout Plan
// Handles both /api/submit-feedback and /submit-feedback and /update-plan/:user_id
async function handleUpdateFeedback(req: Request, res: Response): Promise<void> {
  try {
    const rawId = req.params.user_id ?? req.body.user_id ?? req.body.userId;
    const userId = Number(rawId);
    const feedback = (req.body.feedback ?? req.body.user_feedback ?? '').toString().trim();

    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    if (!feedback) {
      res.status(400).json({ success: false, error: 'Feedback text is required' });
      return;
    }

    const existingPlan = db.getPlan(userId);
    if (!existingPlan) {
      res.status(404).json({
        success: false,
        error: `Original plan not found for user ID: ${userId}`,
      });
      return;
    }

    const basePlan = existingPlan.updated_plan || existingPlan.original_plan;
    const updatedPlan = await updateWorkoutPlanGemini(basePlan, feedback);

    // Save updated plan in database
    const saved = db.updatePlan(userId, updatedPlan, feedback);

    res.json({
      success: true,
      message: 'Your plan has been updated based on your feedback!',
      user_id: userId,
      updated_plan: updatedPlan,
      plan: saved,
    });
  } catch (error: any) {
    console.error('Error updating plan with feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update plan with feedback',
      detail: error?.message || String(error),
    });
  }
}

app.post('/api/submit-feedback', handleUpdateFeedback);
app.post('/submit-feedback', handleUpdateFeedback);
app.post('/update-plan/:user_id', handleUpdateFeedback);

// API: Admin View - Get All Users & Plans (matching /view-all-users API)
app.get('/api/users', (_req: Request, res: Response) => {
  try {
    const users = db.getUsers();
    const plans = db.getPlans();

    const merged = users.map(user => {
      const plan = plans.find(p => p.user_id === user.id);
      return {
        id: user.id,
        name: user.name,
        age: user.age,
        weight: user.weight,
        goal: user.goal,
        intensity: user.intensity,
        created_at: user.created_at,
        original_plan: plan?.original_plan || 'N/A',
        updated_plan: plan?.updated_plan || 'Not updated',
        nutrition_tip: plan?.nutrition_tip || 'N/A',
        last_feedback: plan?.last_feedback || null,
        has_updated_plan: Boolean(plan?.updated_plan),
      };
    });

    res.json({ success: true, count: merged.length, users: merged });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// API: Get Single User & Plan
app.get('/api/users/:user_id', (req: Request, res: Response) => {
  const userId = Number(req.params.user_id);
  const user = db.getUser(userId);
  const plan = db.getPlan(userId);

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.json({
    success: true,
    user,
    plan,
  });
});

// API: Delete User
app.delete('/api/users/:user_id', (req: Request, res: Response) => {
  const userId = Number(req.params.user_id);
  const deleted = db.deleteUser(userId);

  if (!deleted) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.json({ success: true, message: `User ID ${userId} deleted successfully` });
});

// API: Reset DB to Demo Data
app.post('/api/reset-demo', (_req: Request, res: Response) => {
  const data = db.resetToDemo();
  res.json({ success: true, message: 'Database reset to demo state', data });
});

// Integration with Vite
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`🚀 FitBuddy server is running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start FitBuddy server:', err);
  process.exit(1);
});
