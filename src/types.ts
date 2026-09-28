export interface User {
  id: number;
  name: string;
  age: number;
  weight: number;
  goal: string;
  intensity: 'Low' | 'Medium' | 'High';
  created_at: string;
}

export interface WorkoutPlanRecord {
  user_id: number;
  original_plan: string;
  updated_plan: string | null;
  nutrition_tip: string;
  last_feedback?: string | null;
  updated_at?: string;
  created_at: string;
}

export interface MergedUserView extends User {
  original_plan: string;
  updated_plan: string | null;
  nutrition_tip: string;
  last_feedback?: string | null;
  has_updated_plan: boolean;
}

export interface GeneratePlanResponse {
  success: boolean;
  message: string;
  notice?: string;
  user: User;
  plan: WorkoutPlanRecord;
  workout_plan: string;
  nutrition_tip: string;
  user_id: number;
  username: string;
  age: number;
  weight: number;
  goal: string;
  intensity: 'Low' | 'Medium' | 'High';
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  user_id: number;
  updated_plan: string;
  plan: WorkoutPlanRecord;
}
