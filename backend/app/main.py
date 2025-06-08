from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.api import api_router

app = FastAPI(title="Tasks API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api") 