from fastapi import FastAPI

app = FastAPI(
    title="Vaxcribe API",
    description="Backend API for the Vaxcribe video-to-knowledge platform.",
    version="0.1.0",
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