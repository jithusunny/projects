from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from ...database import get_db
from ...crud import project as project_crud
from ...crud import task as task_crud
from ...schemas.project import Project, ProjectCreate, ProjectUpdate
from ...schemas.task import Task, TaskCreate

router = APIRouter()

@router.get("/", response_model=List[Project])
async def read_projects(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    projects = await project_crud.get_projects(db, skip=skip, limit=limit)
    return projects

@router.post("/", response_model=Project)
async def create_project(project: ProjectCreate, db: AsyncSession = Depends(get_db)):
    return await project_crud.create_project(db=db, project=project)

@router.get("/{project_id}", response_model=Project)
async def read_project(
    project_id: UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    db_project = await project_crud.get_project(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    background_tasks.add_task(project_crud.touch_project, db, project_id)
    return db_project

@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: UUID, project: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    db_project = await project_crud.update_project(db, project_id=project_id, project=project)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.delete("/{project_id}")
async def delete_project(project_id: UUID, db: AsyncSession = Depends(get_db)):
    success = await project_crud.delete_project(db, project_id=project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

@router.get("/{project_id}/tasks", response_model=List[Task])
async def read_project_tasks(
    project_id: UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    db_project = await project_crud.get_project(db, project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    background_tasks.add_task(project_crud.touch_project, db, project_id)
    tasks = await task_crud.get_tasks_by_project(db, project_id)
    return tasks

@router.post("/{project_id}/tasks", response_model=Task)
async def create_project_task(project_id: UUID, task: TaskCreate, db: AsyncSession = Depends(get_db)):
    db_project = await project_crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    task_data = task.model_dump()
    task_data["project_id"] = project_id
    new_task = await task_crud.create_task(db, TaskCreate(**task_data))
    return new_task 