from pathlib import Path
import subprocess

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel


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
# Directory configuration
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

EXTRACTED_AUDIO_DIR = BASE_DIR / "extracted_audio"
EXTRACTED_AUDIO_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# FFmpeg configuration
# ---------------------------------------------------------

FFMPEG_PATH = Path(r"C:\ffmpeg\bin\ffmpeg.exe")


# ---------------------------------------------------------
# Whisper configuration
# ---------------------------------------------------------

WHISPER_MODEL_NAME = "base"

print("Loading Faster-Whisper model...")

whisper_model = WhisperModel(
    WHISPER_MODEL_NAME,
    device="cpu",
    compute_type="int8",
)

print("Faster-Whisper model loaded successfully.")


# ---------------------------------------------------------
# Upload configuration
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Audio extraction
# ---------------------------------------------------------

@app.post("/api/extract-audio")
def extract_audio(filename: str):
    # Make sure the filename cannot escape the uploads directory.
    safe_filename = Path(filename).name

    if not safe_filename:
        raise HTTPException(
            status_code=400,
            detail="A filename is required.",
        )

    source_file = UPLOAD_DIR / safe_filename

    if not source_file.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Uploaded file not found: {safe_filename}",
        )

    if not source_file.is_file():
        raise HTTPException(
            status_code=400,
            detail="The selected path is not a valid file.",
        )

    if not FFMPEG_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=(
                "FFmpeg was not found at "
                "C:\\ffmpeg\\bin\\ffmpeg.exe. "
                "Please check the FFmpeg installation."
            ),
        )

    # Always generate WAV output.
    output_filename = f"{source_file.stem}.wav"
    output_file = EXTRACTED_AUDIO_DIR / output_filename

    # If the same audio file already exists, remove it so that
    # FFmpeg can create a fresh version.
    if output_file.exists():
        output_file.unlink()

    command = [
        str(FFMPEG_PATH),
        "-y",
        "-i",
        str(source_file),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-c:a",
        "pcm_s16le",
        str(output_file),
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=600,
        )

    except subprocess.TimeoutExpired as error:
        if output_file.exists():
            output_file.unlink()

        raise HTTPException(
            status_code=504,
            detail="Audio extraction timed out.",
        ) from error

    except Exception as error:
        if output_file.exists():
            output_file.unlink()

        raise HTTPException(
            status_code=500,
            detail="Could not start FFmpeg for audio extraction.",
        ) from error

    if result.returncode != 0:
        if output_file.exists():
            output_file.unlink()

        raise HTTPException(
            status_code=500,
            detail={
                "message": "FFmpeg could not extract audio from this file.",
                "ffmpeg_error": result.stderr[-2000:],
            },
        )

    if not output_file.exists():
        raise HTTPException(
            status_code=500,
            detail="FFmpeg finished, but the audio file was not created.",
        )

    return {
        "message": "Audio extracted successfully.",
        "source_filename": safe_filename,
        "audio_filename": output_file.name,
        "audio_path": str(output_file),
        "size": output_file.stat().st_size,
        "format": "WAV",
        "sample_rate": 16000,
        "channels": 1,
        "status": "audio_extracted",
    }


# ---------------------------------------------------------
# Speech-to-text transcription
# ---------------------------------------------------------

@app.post("/api/transcribe")
def transcribe_audio(filename: str):
    # Make sure the filename cannot escape the extracted_audio directory.
    safe_filename = Path(filename).name

    if not safe_filename:
        raise HTTPException(
            status_code=400,
            detail="An audio filename is required.",
        )

    audio_file = EXTRACTED_AUDIO_DIR / safe_filename

    if not audio_file.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Extracted audio file not found: {safe_filename}",
        )

    if not audio_file.is_file():
        raise HTTPException(
            status_code=400,
            detail="The selected path is not a valid audio file.",
        )

    try:
        segments, info = whisper_model.transcribe(
            str(audio_file),
            beam_size=5,
        )

        transcript_segments = []

        for segment in segments:
            transcript_segments.append(
                {
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "text": segment.text.strip(),
                }
            )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Transcription failed.",
        ) from error

    transcript_text = " ".join(
        segment["text"]
        for segment in transcript_segments
    )

    return {
        "message": "Transcription completed successfully.",
        "audio_filename": safe_filename,
        "language": info.language,
        "language_probability": round(
            info.language_probability,
            4,
        ),
        "transcript": transcript_text,
        "segments": transcript_segments,
        "model": WHISPER_MODEL_NAME,
        "status": "transcribed",
    }
# ---------------------------------------------------------
# Complete media processing
# ---------------------------------------------------------

@app.post("/api/process")
async def process_media(file: UploadFile = File(...)):
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

    # Avoid overwriting existing files.
    if destination.exists():
        stem = destination.stem
        suffix = destination.suffix
        counter = 1

        while destination.exists():
            destination = UPLOAD_DIR / f"{stem}_{counter}{suffix}"
            counter += 1

    total_size = 0

    # -----------------------------------------------------
    # 1. Save uploaded file
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # 2. Determine audio source
    # -----------------------------------------------------

    if file_extension in {".mp3", ".wav"}:
        audio_file = destination

    else:
        # -------------------------------------------------
        # 3. Extract audio from video
        # -------------------------------------------------

        if not FFMPEG_PATH.exists():
            if destination.exists():
                destination.unlink()

            raise HTTPException(
                status_code=500,
                detail=(
                    "FFmpeg was not found at "
                    "C:\\ffmpeg\\bin\\ffmpeg.exe."
                ),
            )

        output_filename = f"{destination.stem}.wav"
        audio_file = EXTRACTED_AUDIO_DIR / output_filename

        if audio_file.exists():
            audio_file.unlink()

        command = [
            str(FFMPEG_PATH),
            "-y",
            "-i",
            str(destination),
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-c:a",
            "pcm_s16le",
            str(audio_file),
        ]

        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=600,
            )

        except subprocess.TimeoutExpired as error:
            if audio_file.exists():
                audio_file.unlink()

            raise HTTPException(
                status_code=504,
                detail="Audio extraction timed out.",
            ) from error

        except Exception as error:
            if audio_file.exists():
                audio_file.unlink()

            raise HTTPException(
                status_code=500,
                detail="Could not start FFmpeg.",
            ) from error

        if result.returncode != 0:
            if audio_file.exists():
                audio_file.unlink()

            raise HTTPException(
                status_code=500,
                detail={
                    "message": "FFmpeg could not extract audio.",
                    "ffmpeg_error": result.stderr[-2000:],
                },
            )

        if not audio_file.exists():
            raise HTTPException(
                status_code=500,
                detail="Audio extraction completed, but no audio file was created.",
            )

    # -----------------------------------------------------
    # 4. Transcribe audio
    # -----------------------------------------------------

    try:
        segments, info = whisper_model.transcribe(
            str(audio_file),
            beam_size=5,
        )

        transcript_segments = []

        for segment in segments:
            transcript_segments.append(
                {
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "text": segment.text.strip(),
                }
            )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Transcription failed.",
        ) from error

    transcript_text = " ".join(
        segment["text"]
        for segment in transcript_segments
    )

    # -----------------------------------------------------
    # 5. Return complete result
    # -----------------------------------------------------

    return {
        "message": "Media processed successfully.",
        "original_filename": original_filename,
        "uploaded_filename": destination.name,
        "uploaded_size": total_size,
        "audio_filename": audio_file.name,
        "language": info.language,
        "language_probability": round(
            info.language_probability,
            4,
        ),
        "transcript": transcript_text,
        "segments": transcript_segments,
        "model": WHISPER_MODEL_NAME,
        "status": "completed",
    }