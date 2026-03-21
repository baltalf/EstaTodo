from pathlib import Path
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse

router = APIRouter()

BASE_PATHS = [
    Path("C:/Users/BALTAZAR/safeguard"),
    Path("C:/Users/BALTAZAR/safeguard/backend"),
    Path(__file__).parent.parent.parent,
    Path(__file__).parent.parent,
]

@router.get("/{filename}")
async def get_video(filename: str, request: Request):
    if not filename.endswith('.mp4'):
        raise HTTPException(status_code=400, detail="Only .mp4 files are allowed for security.")
    
    for base in BASE_PATHS:
        path = base / filename
        if path.exists() and path.is_file():
            return FileResponse(
                path,
                media_type="video/mp4",
                headers={"Accept-Ranges": "bytes"}
            )
            
    raise HTTPException(status_code=404, detail=f"{filename} no encontrado")
