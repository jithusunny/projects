[← Back to main README](../README.md)

# Backend (FastAPI)

This is the backend API and database for the Projects App. 

It handles all project/task data, business logic, and migrations.

## Running locally

### Prerequisites
- [Python 3.10+](https://www.python.org/downloads/)
- [uv](https://github.com/astral-sh/uv#installation)
- [Docker](https://docs.docker.com/get-docker/)

### Setup
1. **Enter the backend folder:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   uv sync
   ```
3. **Start the database:**
   ```bash
   docker compose up
   ```
4. **Copy environment files:**
   ```bash
   cp sample.env .env
   cp sample.docker.env docker.env
   # Edit .env and docker.env as needed
   ```
5. **Run DB migrations:**
   ```bash
   uv run alembic upgrade head
   ```

### Regular Development
- **Start/stop DB:**
  ```bash
  docker compose up
  docker compose down
  ```
- **Run FastAPI backend:**
  ```bash
  uv run uvicorn app.main:app --reload
  ```

### Other Actions
- **Generate a new Alembic migration:**
  ```bash
  uv run alembic revision --autogenerate -m "<message>"
  ```
- **Run Alembic migrations:**
  ```bash
  uv run alembic upgrade head
  ```
- **Install a new package (installs and adds to pyproject.toml):**
  ```bash
  uv pip install <package>
  ```
- **Sync dependencies (after git pull or manual pyproject.toml edit):**
  ```bash
  uv sync
  ```

## Tools & Libraries
_A heartfelt thanks to the creators and maintainers of these tools and libraries:_
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Alembic](https://alembic.sqlalchemy.org/)
- [asyncpg](https://github.com/MagicStack/asyncpg)
- [uv](https://github.com/astral-sh/uv)
- [Pydantic](https://docs.pydantic.dev/)
- [Python-dotenv](https://github.com/theskumar/python-dotenv)
- [Docker](https://www.docker.com/)

---

Looking for the frontend? [See the frontend README →](../frontend/README.md) 