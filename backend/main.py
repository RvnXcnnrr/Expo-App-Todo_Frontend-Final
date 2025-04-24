from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4
import sqlalchemy
from databases import Database

DATABASE_URL = "postgresql://tasks_database_a73m_user:Vy1NQSFpOzjoqz7aeESPs7er4o0icuWy@dpg-d04ou3p5pdvs73aa2jqg-a.oregon-postgres.render.com/tasks_database_a73m"

database = Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

tasks = sqlalchemy.Table(
    "tasks",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("text", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("completed", sqlalchemy.Boolean, default=False),
    sqlalchemy.Column("category", sqlalchemy.String, default="Personal"),
    sqlalchemy.Column("priority", sqlalchemy.String, default="Medium"),
    sqlalchemy.Column("createdAt", sqlalchemy.String, nullable=True),
    sqlalchemy.Column("dueDate", sqlalchemy.String, nullable=True),
)

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

@app.on_event("startup")
async def startup():
    await database.connect()
    # Create the table if it doesn't exist
    query = """
    CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR PRIMARY KEY,
        text VARCHAR NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        category VARCHAR DEFAULT 'Personal',
        priority VARCHAR DEFAULT 'Medium',
        "createdAt" VARCHAR,
        "dueDate" VARCHAR
    );
    """
    await database.execute(query=query)

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get("/")
async def root():
    return {"message": "Welcome to the Todo App FastAPI backend"}

@app.get("/tasks", response_model=List[Task])
async def get_tasks():
    query = tasks.select()
    rows = await database.fetch_all(query)
    return [Task(**row) for row in rows]

@app.post("/tasks", response_model=Task)
async def add_task(task: Task):
    query = tasks.insert().values(
        id=task.id,
        text=task.text,
        completed=task.completed,
        category=task.category,
        priority=task.priority,
        createdAt=task.createdAt,
        dueDate=task.dueDate,
    )
    await database.execute(query)
    return task

@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, updated_task: Task):
    query = tasks.update().where(tasks.c.id == task_id).values(
        text=updated_task.text,
        completed=updated_task.completed,
        category=updated_task.category,
        priority=updated_task.priority,
        createdAt=updated_task.createdAt,
        dueDate=updated_task.dueDate,
    )
    result = await database.execute(query)
    # Check if the task exists
    select_query = tasks.select().where(tasks.c.id == task_id)
    task = await database.fetch_one(select_query)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    query = tasks.delete().where(tasks.c.id == task_id)
    result = await database.execute(query)
    # Check if the task exists
    select_query = tasks.select().where(tasks.c.id == task_id)
    task = await database.fetch_one(select_query)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"detail": "Task deleted"}
