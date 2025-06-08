from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List
from .task import Task

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None

class Project(ProjectBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    tasks: List[Task] = []

    class Config:
        from_attributes = True 