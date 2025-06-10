from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ...database import get_db
from ...models.project import Project
from ...models.task import Task
from ...utils.admin import export_model_to_csv, parse_row
from datetime import datetime, timezone
import csv
from io import StringIO
import uuid
from sqlalchemy import text

router = APIRouter()

@router.get("/export/", tags=["admin"])
async def export_tables(db: AsyncSession = Depends(get_db)):
    timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
    models = [Project, Task]
    exported = []
    for model in models:
        exported.append(await export_model_to_csv(db, model, timestamp))
    return {"exported": exported}

@router.post("/import/", tags=["admin"])
async def import_tables(files: list[UploadFile] = File(...), db: AsyncSession = Depends(get_db)):
    table_map = {
        'projects': Project,
        'tasks': Task,
    }
    try:
        async with db.begin():
            for file in files:
                name = file.filename.split('_')[0].lower()
                model = table_map.get(name)
                if not model:
                    raise HTTPException(status_code=400, detail=f"Unknown table for file: {file.filename}")
                content = await file.read()
                reader = csv.DictReader(StringIO(content.decode('utf-8')))
                for row in reader:
                    obj = model(**parse_row(model, row))
                    db.add(obj)
        return {"imported": [file.filename for file in files]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")

@router.post("/delete_all/", tags=["admin"])
async def delete_all_data(db: AsyncSession = Depends(get_db)):
    try:
        async with db.begin():
            await db.execute(text("DELETE FROM tasks"))
            await db.execute(text("DELETE FROM projects"))
        return {"message": "All data deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}") 