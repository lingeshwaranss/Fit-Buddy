from sqlalchemy import create_engine, Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fitbuddy.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False)
    goal = Column(String(255), nullable=False)
    intensity = Column(String(50), nullable=False)
    schedule = Column(Integer, default=7)
    created_at = Column(DateTime, default=datetime.utcnow)

    workout_plan = relationship("WorkoutPlan", back_populates="user", uselist=False, cascade="all, delete-orphan")

class WorkoutPlan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    original_plan = Column(Text, nullable=False)
    updated_plan = Column(Text, nullable=True)
    nutrition_tip = Column(Text, nullable=True)
    last_feedback = Column(Text, nullable=True)
    updated_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="workout_plan")

# Helper functions specified in documentation
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_user(user_id: int, name: str, age: int, weight: float, goal: str, intensity: str):
    db = SessionLocal()
    try:
        existing = db.query(User).filter_by(id=user_id).first()
        if existing:
            existing.name = name
            existing.age = age
            existing.weight = weight
            existing.goal = goal
            existing.intensity = intensity
        else:
            new_user = User(
                id=user_id,
                name=name,
                age=age,
                weight=weight,
                goal=goal,
                intensity=intensity,
                schedule=7
            )
            db.add(new_user)
        db.commit()
    finally:
        db.close()

def save_plan(user_id: int, plan: str, nutrition_tip: str = None):
    db = SessionLocal()
    try:
        workout = db.query(WorkoutPlan).filter_by(user_id=user_id).first()
        if workout:
            workout.original_plan = plan
            if nutrition_tip:
                workout.nutrition_tip = nutrition_tip
        else:
            workout = WorkoutPlan(
                user_id=user_id,
                original_plan=plan,
                nutrition_tip=nutrition_tip
            )
            db.add(workout)
        db.commit()
    finally:
        db.close()

def update_plan(user_id: int, updated_text: str, feedback: str = None):
    db = SessionLocal()
    try:
        workout = db.query(WorkoutPlan).filter_by(user_id=user_id).first()
        if workout:
            workout.updated_plan = updated_text
            if feedback:
                workout.last_feedback = feedback
            workout.updated_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()

def get_original_plan(user_id: int) -> str:
    db = SessionLocal()
    try:
        plan = db.query(WorkoutPlan).filter_by(user_id=user_id).first()
        return plan.original_plan if plan else None
    finally:
        db.close()

def get_workout_plan(user_id: int):
    db = SessionLocal()
    try:
        return db.query(WorkoutPlan).filter_by(user_id=user_id).first()
    finally:
        db.close()

def get_user(user_id: int):
    db = SessionLocal()
    try:
        return db.query(User).filter_by(id=user_id).first()
    finally:
        db.close()

def get_all_users():
    db = SessionLocal()
    try:
        return db.query(User).all()
    finally:
        db.close()

def get_all_plans():
    db = SessionLocal()
    try:
        return db.query(WorkoutPlan).all()
    finally:
        db.close()

def delete_user(user_id: int) -> bool:
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(id=user_id).first()
        if user:
            db.delete(user)
            db.commit()
            return True
        return False
    finally:
        db.close()

# Auto-create tables on import
Base.metadata.create_all(bind=engine)
