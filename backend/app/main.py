from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Vaxcribe API",
    description="Backend API for the Vaxcribe video-to-knowledge platform.",
    version="0.1.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Upload configuration
# ---------------------------------------------------------

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".mp4",
    ".mov",
    ".webm",
    ".avi",
    ".mp3",
    ".wav",
}

MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB


# ---------------------------------------------------------
# Basic routes
# ---------------------------------------------------------

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
        "message": "Backend is ready",
    }


# ---------------------------------------------------------
# Media upload
# ---------------------------------------------------------

@app.post("/api/upload")
async def upload_media(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was selected.",
        )

    original_filename = Path(file.filename).name
    file_extension = Path(original_filename).suffix.lower()

    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file format. "
                "Supported formats are MP4, MOV, WEBM, AVI, MP3 and WAV."
            ),
        )

    safe_filename = original_filename.replace(" ", "_")
    destination = UPLOAD_DIR / safe_filename

    # Avoid accidentally overwriting an existing file.
    if destination.exists():
        stem = destination.stem
        suffix = destination.suffix

        counter = 1

        while destination.exists():
            destination = UPLOAD_DIR / f"{stem}_{counter}{suffix}"
            counter += 1

    total_size = 0

    try:
        with destination.open("wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    buffer.close()

                    if destination.exists():
                        destination.unlink()

                    raise HTTPException(
                        status_code=413,
                        detail="File is too large. Maximum allowed size is 500 MB.",
                    )

                buffer.write(chunk)

    except HTTPException:
        raise

    except Exception as error:
        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=500,
            detail="The file could not be uploaded.",
        ) from error

    finally:
        await file.close()

    return {
        "message": "File uploaded successfully.",
        "filename": destination.name,
        "original_filename": original_filename,
        "size": total_size,
        "content_type": file.content_type,
        "status": "uploaded",
    }