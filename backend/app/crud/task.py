from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from uuid import UUID
from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate

async def get_task(db: AsyncSession, task_id: UUID) -> Optional[Task]:
    result = await db.execute(select(Task).where(Task.id == task_id))
    return result.scalars().first()

async def get_tasks(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Task]:
    result = await db.execute(
        select(Task).where(Task.project_id == None).order_by(desc(Task.updated_at)).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def get_tasks_by_project(db: AsyncSession, project_id: UUID, skip: int = 0, limit: int = 100) -> List[Task]:
    result = await db.execute(
        select(Task).where(Task.project_id == project_id).order_by(desc(Task.updated_at)).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create_task(db: AsyncSession, task: TaskCreate) -> Task:
    db_task = Task(**task.model_dump())
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task

async def update_task(db: AsyncSession, task_id: UUID, task: TaskUpdate) -> Optional[Task]:
    db_task = await get_task(db, task_id)
    if db_task:
        update_data = task.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)
        await db.commit()
        await db.refresh(db_task)
    return db_task

async def delete_task(db: AsyncSession, task_id: UUID) -> bool:
    db_task = await get_task(db, task_id)
    if db_task:
        await db.delete(db_task)
        await db.commit()
        return True
    return False 