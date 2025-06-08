from fastapi import APIRouter
from .endpoints import tasks, projects

api_router = APIRouter()
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"]) 