import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Optional

# 업로드 디렉토리 설정
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 각 카테고리별 디렉토리
MEMBER_IMAGES_DIR = UPLOAD_DIR / "members"
LOGOS_DIR = UPLOAD_DIR / "logos"
GENERAL_IMAGES_DIR = UPLOAD_DIR / "images"

# 디렉토리 생성
MEMBER_IMAGES_DIR.mkdir(exist_ok=True)
LOGOS_DIR.mkdir(exist_ok=True)
GENERAL_IMAGES_DIR.mkdir(exist_ok=True)

# 허용된 이미지 확장자
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}

# 최대 파일 크기 (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024


def is_allowed_file(filename: str) -> bool:
    """파일 확장자 확인"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS


async def save_uploaded_file(
    file: UploadFile,
    category: str = "general",
    custom_filename: Optional[str] = None
) -> str:
    """
    업로드된 파일 저장
    
    Args:
        file: 업로드된 파일
        category: 파일 카테고리 (members, logos, images)
        custom_filename: 사용자 지정 파일명 (확장자 제외)
    
    Returns:
        저장된 파일의 URL 경로
    """
    # 파일 확장자 확인
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"허용되지 않는 파일 형식입니다. 허용된 형식: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 파일 크기 확인
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"파일 크기가 너무 큽니다. 최대 크기: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # 파일명 생성
    ext = Path(file.filename).suffix.lower()
    if custom_filename:
        filename = f"{custom_filename}{ext}"
    else:
        filename = f"{uuid.uuid4()}{ext}"
    
    # 카테고리별 디렉토리 선택
    if category == "members":
        save_dir = MEMBER_IMAGES_DIR
    elif category == "logos":
        save_dir = LOGOS_DIR
    else:
        save_dir = GENERAL_IMAGES_DIR
    
    # 파일 저장
    file_path = save_dir / filename
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # URL 경로 반환 (프론트엔드에서 접근 가능한 경로)
    return f"/uploads/{category}/{filename}"


def delete_file(file_path: str) -> bool:
    """
    파일 삭제
    
    Args:
        file_path: 삭제할 파일의 URL 경로
    
    Returns:
        삭제 성공 여부
    """
    try:
        # URL 경로를 실제 파일 경로로 변환
        if file_path.startswith("/uploads/"):
            actual_path = Path(file_path.lstrip("/"))
        else:
            actual_path = Path(file_path)
        
        if actual_path.exists():
            actual_path.unlink()
            return True
        return False
    except Exception:
        return False


def get_file_list(category: str = "general") -> list:
    """
    카테고리별 파일 목록 조회
    
    Args:
        category: 파일 카테고리
    
    Returns:
        파일 URL 목록
    """
    if category == "members":
        dir_path = MEMBER_IMAGES_DIR
    elif category == "logos":
        dir_path = LOGOS_DIR
    else:
        dir_path = GENERAL_IMAGES_DIR
    
    files = []
    if dir_path.exists():
        for file_path in dir_path.iterdir():
            if file_path.is_file() and is_allowed_file(file_path.name):
                files.append(f"/uploads/{category}/{file_path.name}")
    
    return files

