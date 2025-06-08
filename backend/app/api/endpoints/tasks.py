from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from ...database import get_db
from ...crud import task as task_crud
from ...schemas.task import Task, TaskCreate, TaskUpdate
from ...crud import project as project_crud

router = APIRouter()

@router.get("/", response_model=List[Task])
async def read_tasks(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    tasks = await task_crud.get_tasks(db, skip=skip, limit=limit)
    return tasks

@router.post("/", response_model=Task)
async def create_task(task: TaskCreate, db: AsyncSession = Depends(get_db)):
    return await task_crud.create_task(db=db, task=task)

@router.get("/{task_id}", response_model=Task)
async def read_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    db_task = await task_crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: UUID, task: TaskUpdate, db: AsyncSession = Depends(get_db)):
    db_task = await task_crud.update_task(db, task_id=task_id, task=task)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.delete("/{task_id}")
async def delete_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    success = await task_crud.delete_task(db, task_id=task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"} 