from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4

app = FastAPI()

# Enable CORS for local development
origins = [
    "http://localhost",
    "http://localhost:19006",  # Expo default
    "http://127.0.0.1",
    "http://127.0.0.1:19006",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    text: str
    completed: bool = False
    category: Optional[str] = "Personal"
    priority: Optional[str] = "Medium"
    createdAt: Optional[str] = None
    dueDate: Optional[str] = None

# In-memory task storage
tasks_db = {}

@app.get("/")
def root():
    return {"message": "Welcome to the Todo App FastAPI backend"}

@app.get("/tasks", response_model=List[Task])
def get_tasks():
    return list(tasks_db.values())

@app.post("/tasks", response_model=Task)
def add_task(task: Task):
    tasks_db[task.id] = task
    return task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, updated_task: Task):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    tasks_db[task_id] = updated_task
    return updated_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    del tasks_db[task_id]
    return {"detail": "Task deleted"}
