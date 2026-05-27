import os
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.api.v1.endpoints.analyze import router as analyze_router


# ============================================================
# Logging
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger("webdoctor")


# ============================================================
# Environment validation
# ============================================================

def validate_environment():

    required_vars = {
        "SUPABASE_URL":
            settings.SUPABASE_URL,

        "SUPABASE_SERVICE_ROLE_KEY":
            settings.SUPABASE_SERVICE_ROLE_KEY,

        "GROQ_API_KEY":
            settings.GROQ_API_KEY
    }

    missing = [
        k for k, v in required_vars.items()
        if not v
    ]

    if missing:
        logger.warning(
            f"Missing environment variables: {', '.join(missing)}"
        )

        return False

    logger.info(
        "✅ All required environment variables are loaded."
    )

    return True


# ============================================================
# Startup lifecycle
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("🚀 WebDoctor starting...")

    try:

        validate_environment()

        logger.info(
            "✅ Startup completed successfully"
        )

    except Exception as e:

        logger.exception(
            f"Startup error: {e}"
        )

    yield

    logger.info("🛑 WebDoctor shutting down...")


# ============================================================
# Rate limiter
# ============================================================

limiter = Limiter(
    key_func=get_remote_address
)


# ============================================================
# FastAPI App
# ============================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Diagnostics & Audit Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# Request middleware
# ============================================================

@app.middleware("http")
async def request_middleware(
    request: Request,
    call_next
):

    start = time.perf_counter()

    try:

        response = await call_next(request)

        duration = (
            time.perf_counter()
            - start
        )

        response.headers[
            "X-Process-Time"
        ] = f"{duration:.4f}"

        return response

    except Exception as e:

        logger.exception(
            f"Request failed: "
            f"{request.method} "
            f"{request.url.path}"
        )

        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(e)
            }
        )


# ============================================================
# Global exception boundary
# ============================================================

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):

    logger.exception(
        f"Unhandled exception: {exc}"
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "detail":
            "Internal server error"
        }
    )


# ============================================================
# Routes
# ============================================================

app.include_router(
    analyze_router,
    prefix=settings.API_V1_STR
)


@app.get("/")
async def root():

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }


@app.get("/health")
async def health():

    return {
        "status": "ok",
        "railway": True
    }