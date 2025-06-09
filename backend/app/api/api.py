from fastapi import APIRouter
from .endpoints import tasks, projects, admin

api_router = APIRouter()
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"]) 