from logging import getLogger
from logging.config import fileConfig

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes import heartbeat
from src.settings import get_settings

fileConfig("src/logging.ini", disable_existing_loggers=False)
root_logger = getLogger()

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="API for the sample application.",
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Accept",
        "Cache-Control",
        "Origin",
    ],
    expose_headers=["Content-Disposition"],
)

app.include_router(
    heartbeat.router,
    prefix="/api/heartbeat",
    tags=["Root"],
)
