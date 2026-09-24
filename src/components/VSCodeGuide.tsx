import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Code2,
  FolderTree,
  Play,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Cpu,
  Layers
} from 'lucide-react';

export const VSCodeGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('app/main.py');

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeFiles: Record<string, string> = {
    'app/main.py': `import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import router
from app.database import Base, engine, save_user, save_plan

app = FastAPI(
    title="FitBuddy – AI Fitness Plan Generator",
    description="FastAPI + Gemini AI 7-day personalized workout plan and nutrition tip generator",
    version="1.0.0"
)

# Static & Templates setup
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)`,

    'app/routes.py': `from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app.gemini_generator import generate_workout_gemini
from app.gemini_flash_generator import generate_nutrition_tip_with_flash
from app.updated_plan import update_workout_plan
from app.database import save_user, save_plan, update_plan, get_original_plan, get_all_users, get_all_plans

router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

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
    save_user(user_id, username, age, weight, goal, intensity)
    workout_plan = generate_workout_gemini({"username": username, "goal": goal, "intensity": intensity, "age": age, "weight": weight})
    nutrition_tip = generate_nutrition_tip_with_flash(goal)
    save_plan(user_id, workout_plan, nutrition_tip)
    return templates.TemplateResponse("result.html", {
        "request": request, "username": username, "user_id": user_id, "age": age,
        "weight": weight, "goal": goal, "intensity": intensity,
        "workout_plan": workout_plan, "nutrition_tip": nutrition_tip
    })

@router.post("/submit-feedback", response_class=HTMLResponse)
async def submit_feedback_html(request: Request, user_id: int = Form(...), feedback: str = Form(...)):
    original = get_original_plan(user_id)
    updated = update_workout_plan(original, feedback)
    update_plan(user_id, updated, feedback)
    return templates.TemplateResponse("result.html", {
        "request": request, "user_id": user_id, "workout_plan": updated, "updated_success": True
    })

@router.get("/view-all-users", response_class=HTMLResponse)
async def view_all_users_html(request: Request):
    users = get_all_users()
    return templates.TemplateResponse("all_users.html", {"request": request, "users": users})`,

    'app/gemini_generator.py': `import os
import google.generativeai as genai

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-pro")

def generate_workout_gemini(user_input: dict) -> str:
    prompt = f"""You are a professional fitness trainer.
Create a personalized, structured 7-day workout plan for {user_input['username']} (Goal: {user_input['goal']}, Intensity: {user_input['intensity']}).
Each day must include:
- A warm-up (5-10 mins)
- Main workout (exercise details, sets & reps)
- Cooldown or recovery tip
Format: Day 1 to Day 7 with Warm-up, Main Workout, Cooldown.
"""
    response = model.generate_content(prompt)
    return response.text.strip()`,

    'app/gemini_flash_generator.py': `import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
flash_model = genai.GenerativeModel("gemini-1.5-flash")

def generate_nutrition_tip_with_flash(goal: str) -> str:
    prompt = f"Give one clear, helpful nutrition or recovery tip for someone focused on '{goal}'."
    response = flash_model.generate_content(prompt)
    return response.text.strip()`,

    'requirements.txt': `fastapi>=0.109.0
uvicorn[standard]>=0.27.0
jinja2>=3.1.2
sqlalchemy>=2.0.25
python-multipart>=0.0.9
google-generativeai>=0.8.0
python-dotenv>=1.0.1
pydantic>=2.6.0
requests>=2.31.0`
  };

  const setupSteps = [
    {
      title: '1. Open Folder in VS Code',
      desc: 'Launch VS Code and open the fitbuddy project directory:',
      cmd: 'cd fitbuddy\ncode .',
    },
    {
      title: '2. Create & Activate Virtual Environment',
      desc: 'Isolate dependencies using Python venv (Windows vs macOS/Linux):',
      cmd: '# On Windows (PowerShell/CMD):\npython -m venv venv\nvenv\\Scripts\\activate\n\n# On macOS / Linux:\npython3 -m venv venv\nsource venv/bin/activate',
    },
    {
      title: '3. Install Required Dependencies',
      desc: 'Install FastAPI, Uvicorn, SQLAlchemy, and Google Generative AI SDK:',
      cmd: 'pip install -r requirements.txt',
    },
    {
      title: '4. Configure Your Gemini API Key',
      desc: 'Create a .env file with your Google Gemini API key:',
      cmd: '# Copy template\ncp .env.example .env\n\n# Edit .env and set your key:\nGOOGLE_API_KEY="AIzaSyYourActualKeyHere"',
    },
    {
      title: '5. Launch the Server',
      desc: 'Start Uvicorn with automatic code reloading on port 8000:',
      cmd: 'uvicorn app.main:app --reload --port 8000',
    },
    {
      title: '6. Run Automated Test Suite',
      desc: 'In a separate terminal, test all 4 project scenarios automatically:',
      cmd: 'python test_api.py',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                VS Code Setup & Python Deployment Guide
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Complete instructions to set up, install, run, and verify the FitBuddy FastAPI + Gemini application.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Python 3.10+
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              FastAPI + Uvicorn
            </span>
          </div>
        </div>

        {/* Milestone Map from PDF */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Project Milestones from Documentation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                m: 'Milestone 1',
                title: 'Model & Architecture',
                detail: 'Gemini Pro for 7-day plans, Gemini Flash for nutrition tips, SQLite with SQLAlchemy.',
              },
              {
                m: 'Milestone 2',
                title: 'Core Functions',
                detail: 'generate_workout_gemini(), generate_nutrition_tip_with_flash(), update_workout_plan().',
              },
              {
                m: 'Milestone 3',
                title: 'routes.py Logic',
                detail: 'Handling form POSTs, Jinja2 template responses, and REST endpoints.',
              },
              {
                m: 'Milestone 4',
                title: 'Frontend Templates',
                detail: 'index.html (form), result.html (plan & feedback), all_users.html (admin).',
              },
              {
                m: 'Milestone 5',
                title: 'Local Deployment',
                detail: 'Uvicorn ASGI server, virtual environment, and interactive docs at /docs.',
              },
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">{step.m}</div>
                  <h3 className="text-xs font-bold text-white mb-1.5">{step.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.detail}</p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <CheckCircle className="w-3 h-3" />
                  <span>Fully Implemented</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Setup Commands */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>Step-by-Step VS Code Setup & Terminal Commands</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {setupSteps.map((step, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{step.desc}</p>
                </div>

                <div className="relative group">
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-300 whitespace-pre-wrap">
                    {step.cmd}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(step.cmd, idx)}
                    className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                    title="Copy command"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Python Code Viewer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <span>Project Files in /fitbuddy:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.keys(codeFiles).map(file => (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    selectedFile === file
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {file}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-950/70">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
              <span className="font-mono text-blue-300">File: {selectedFile}</span>
              <button
                onClick={() => copyToClipboard(codeFiles[selectedFile], 99)}
                className="hover:text-white flex items-center gap-1"
              >
                {copiedIndex === 99 ? (
                  <span className="text-emerald-400 font-semibold">✓ Copied to clipboard</span>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-[380px] overflow-y-auto">
              {codeFiles[selectedFile]}
            </pre>
          </div>
        </div>

        {/* Testing URLs Card */}
        <div className="bg-linear-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-blue-800/40 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Local Access Points when Running Uvicorn:</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-slate-400 block mb-1">User Form Page:</span>
              <code className="text-cyan-400 font-mono">http://127.0.0.1:8000/</code>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-slate-400 block mb-1">Admin Dashboard:</span>
              <code className="text-cyan-400 font-mono">http://127.0.0.1:8000/view-all-users</code>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-slate-400 block mb-1">Interactive API Docs:</span>
              <code className="text-cyan-400 font-mono">http://127.0.0.1:8000/docs</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
