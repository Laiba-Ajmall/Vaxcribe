from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Vaxcribe API",
    description="Backend API for the Vaxcribe video-to-knowledge platform.",
    version="0.1.0",
)

# Allow the Next.js frontend to communicate with the FastAPI backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to Vaxcribe API",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/api/status")
def api_status():
    return {
        "service": "Vaxcribe API",
        "status": "connected",
        "message": "Backend is ready"
    }