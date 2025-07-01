from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete, update
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import func
from uuid import UUID
from ..models.project import Project
from ..schemas.project import ProjectCreate, ProjectUpdate

async def get_projects(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.tasks))
        .order_by(desc(Project.last_accessed))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_project(db: AsyncSession, project_id: UUID) -> Project:
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.tasks))
        .filter(Project.id == project_id)
    )
    return result.scalar_one_or_none()

async def touch_project(db: AsyncSession, project_id: UUID):
    await db.execute(
        update(Project)
        .where(Project.id == project_id)
        .values(last_accessed=func.now())
    )
    await db.commit()

async def create_project(db: AsyncSession, project: ProjectCreate):
    db_project = Project(**project.model_dump())
    db.add(db_project)
    await db.commit()
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks)).where(Project.id == db_project.id)
    )
    return result.scalar_one()

async def update_project(db: AsyncSession, project_id: UUID, project: ProjectUpdate):
    update_data = project.model_dump(exclude_unset=True)
    await db.execute(
        update(Project)
        .where(Project.id == project_id)
        .values(**update_data, last_accessed=func.now())
    )
    await db.commit()
    return await get_project(db, project_id)

async def delete_project(db: AsyncSession, project_id: UUID):
    db_project = await get_project(db, project_id)
    if db_project:
        await db.delete(db_project)
        await db.commit()
        return True
    return False 