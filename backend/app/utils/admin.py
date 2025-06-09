import csv
import os
from datetime import timezone, datetime
import uuid

EXPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../exports'))

async def export_model_to_csv(db, model, timestamp):
    table = model.__table__
    result = await db.execute(table.select())
    rows = result.fetchall()
    fields = [col.name for col in table.columns]
    filename = f"{table.name}_{timestamp}.csv"
    os.makedirs(EXPORTS_DIR, exist_ok=True)
    path = os.path.join(EXPORTS_DIR, filename)
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(fields)
        for row in rows:
            writer.writerow([getattr(row, field) for field in fields])
    return filename

def parse_row(model, row):
    parsed = {}
    for col in model.__table__.columns:
        val = row.get(col.name)
        if val is None or val == '':
            continue
        col_type = str(col.type).upper()
        if 'UUID' in col_type:
            val = uuid.UUID(val)
        elif 'BOOLEAN' in col_type:
            val = val.lower() in ('true', '1', 'yes')
        elif 'DATETIME' in col_type or 'TIMESTAMP' in col_type:
            val = datetime.fromisoformat(val)
        parsed[col.name] = val
    return parsed 