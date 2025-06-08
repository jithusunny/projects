from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from uuid import UUID
from ..models.project import Project
from ..schemas.project import ProjectCreate, ProjectUpdate

async def get_projects(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks)).order_by(desc(Project.updated_at)).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def get_project(db: AsyncSession, project_id: UUID):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks)).where(Project.id == project_id)
    )
    return result.scalars().first()

async def create_project(db: AsyncSession, project: ProjectCreate):
    db_project = Project(**project.model_dump())
    db.add(db_project)
    await db.commit()
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks)).where(Project.id == db_project.id)
    )
    return result.scalar_one()

async def update_project(db: AsyncSession, project_id: UUID, project: ProjectUpdate):
    db_project = await get_project(db, project_id)
    if db_project:
        update_data = project.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_project, key, value)
        await db.commit()
        await db.refresh(db_project)
    return db_project

async def delete_project(db: AsyncSession, project_id: UUID):
    db_project = await get_project(db, project_id)
    if db_project:
        await db.delete(db_project)
        await db.commit()
        return True
    return False 