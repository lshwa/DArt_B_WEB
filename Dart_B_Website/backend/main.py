from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional
import httpx
from urllib.parse import unquote
from pathlib import Path

from settings import settings
from database import get_db, init_db, Admin, Member, Setting
from file_upload import save_uploaded_file, delete_file, get_file_list
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY
)
from schemas import (
    Token,
    AdminLogin,
    AdminCreate,
    AdminResponse,
    MemberCreate,
    MemberUpdate,
    MemberResponse,
    PDFUploadResponse,
)
from pdf_parser import parse_pdf, parse_csv_from_pdf
from google_forms import sync_with_service_account

app = FastAPI(title="DArt-B Backend", version="1.0.0")

# CORS configuration from environment variables
# In production, set CORS_ORIGINS env var to your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙 (업로드된 이미지)
# 업로드 디렉토리 생성
from pathlib import Path
upload_dir = Path("uploads")
upload_dir.mkdir(exist_ok=True)
(upload_dir / "members").mkdir(exist_ok=True)
(upload_dir / "logos").mkdir(exist_ok=True)
(upload_dir / "images").mkdir(exist_ok=True)

# 정적 파일 서빙을 위한 커스텀 엔드포인트 (URL 인코딩된 경로 처리)
# 이 엔드포인트는 StaticFiles mount보다 먼저 정의되어야 함
@app.get("/uploads/{category}/{filename:path}")
async def serve_uploaded_file(category: str, filename: str):
    """업로드된 파일 서빙 (URL 인코딩된 파일명 처리)"""
    try:
        # URL 디코딩
        decoded_filename = unquote(filename)
        file_path = upload_dir / category / decoded_filename
        
        # 파일 존재 확인
        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="File not found")
        
        # 파일 타입 확인 (이미지인 경우)
        if file_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']:
            media_type_map = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml'
            }
            media_type = media_type_map.get(file_path.suffix.lower(), 'image/jpeg')
            return FileResponse(
                str(file_path),
                media_type=media_type
            )
        else:
            return FileResponse(str(file_path))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")

# 기본 정적 파일 서빙도 유지 (fallback) - 커스텀 엔드포인트가 매칭되지 않을 때 사용
# 주의: FastAPI는 라우트를 순서대로 매칭하므로, 위의 커스텀 엔드포인트가 먼저 정의되어야 함
# 하지만 mount는 다른 방식으로 동작하므로, 커스텀 엔드포인트만 사용


# 데이터베이스 초기화
@app.on_event("startup")
async def startup_event():
    init_db()
    db = next(get_db())
    
    # 기본 관리자 계정 생성 (없는 경우)
    admin = db.query(Admin).filter(Admin.username == "admin").first()
    if not admin:
        default_admin = Admin(
            username="admin",
            email="admin@dartb.com",
            hashed_password=get_password_hash("admin123"),
            is_active=True
        )
        db.add(default_admin)
        db.commit()
    
    # 기본 설정 생성 (없는 경우)
    logo_setting = db.query(Setting).filter(Setting.key == "logo_white").first()
    if not logo_setting:
        default_logo = Setting(
            key="logo_white",
            value="/uploads/logos/logo-white.png",
            description="헤더 및 푸터에 사용되는 흰색 로고"
        )
        db.add(default_logo)
        db.commit()

    # 사이트 이미지 초기 설정 (없는 경우만 추가)
    site_images_defaults = [
        ("site_image.home.hero.background", "https://images.unsplash.com/photo-1702737832079-ed5864397f92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MDQ3MTF8MHwxfHNlYXJjaHw4fHx1bml2ZXJzaXR5JTIwY2FtcHVzfGVufDB8fHx8MTczMjc1NzIzNnww&ixlib=rb-4.0.3&q=85", "메인 히어로 배경 이미지"),
        ("site_image.home.curriculum.session", "https://images.unsplash.com/photo-1758691736764-2a88e313b1f2?w=600&auto=format&fit=crop&q=60", "홈 - 정규 세션 활동"),
        ("site_image.home.curriculum.project", "https://images.unsplash.com/photo-1758691736804-4e88c52ad58b?w=600&auto=format&fit=crop&q=60", "홈 - 프로젝트 활동"),
        ("site_image.networking.event", "https://images.unsplash.com/photo-1702737832079-ed5864397f92?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MDQ3MTF8MHwxfHNlYXJjaHw4fHx1bml2ZXJzaXR5JTIwY2FtcHVzfGVufDB8fHx8MTczMjc1NzIzNnww&ixlib=rb-4.0.3&q=85", "네트워킹 이벤트"),
        ("site_image.networking.activity", "https://images.unsplash.com/photo-1758691736764-2a88e313b1f2?w=600&auto=format&fit=crop&q=60", "네트워킹 활동"),
        ("site_image.networking.group", "https://images.unsplash.com/photo-1758691736804-4e88c52ad58b?w=600&auto=format&fit=crop&q=60", "단체 사진"),
        ("site_image.datathon.angnal", "https://images.unsplash.com/photo-1758691736804-4e88c52ad58b?w=600&auto=format&fit=crop&q=60", "앵날다쏘 이미지"),
        ("site_image.datathon.aruda", "https://images.unsplash.com/photo-1758691736764-2a88e313b1f2?w=600&auto=format&fit=crop&q=60", "아러다 이미지"),
        ("site_image.datathon.kukudart", "https://images.unsplash.com/photo-1587116987928-21e47bd76cd2?w=600&auto=format&fit=crop&q=60", "쿠쿠다트 이미지"),
        ("site_image.curriculum.assignment", "https://images.unsplash.com/photo-1589380905297-abf6a0a8e450?w=600&auto=format&fit=crop&q=60", "정규 과제 이미지"),
        ("site_image.curriculum.study", "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?w=600&auto=format&fit=crop&q=60", "스터디 그룹 이미지"),
    ]

    for key, value, description in site_images_defaults:
        existing = db.query(Setting).filter(Setting.key == key).first()
        if not existing:
            setting = Setting(key=key, value=value, description=description)
            db.add(setting)

    # 사이트 텍스트 초기 설정 (없는 경우만 추가)
    site_texts_defaults = [
        # Home banner
        ("site_text.home.hero.title", "DArt-B", "홈 배너 제목"),
        ("site_text.home.hero.subtitle", "Data Analysis road to Business", "홈 배너 부제목"),
        ("site_text.home.hero.description", "A community for data-driven insights and decision-making in a dynamic and diversified business environment", "홈 배너 설명"),
        # About Us
        ("site_text.about.intro", "DArt-B는 다변화된 비즈니스 환경에서 데이터에 기반하여 INSIGHT를 도출하고 의사결정을 하고자 하는 사람들의 모임입니다.", "About us 소개"),
        ("site_text.about.body1", "DArt-B(Data Analysis road to Business)는 중앙대학교 경영학부에서 활동하는 데이터 분석 학회입니다.", "About us 본문 1"),
        ("site_text.about.body2", "우리는 데이터를 통해 비즈니스 인사이트를 도출하고, 실무에 적용할 수 있는 역량을 기르는 것을 목표로 합니다. 이론과 실습을 균형있게 배우며, 다양한 프로젝트와 대회 참여를 통해 실전 경험을 쌓아갑니다.", "About us 본문 2"),
        ("site_text.about.body3", "매 학기 정규 세션, 스터디, 프로젝트, 그리고 네트워킹 이벤트를 통해 학회원들이 함께 성장할 수 있는 환경을 만들어가고 있습니다.", "About us 본문 3"),
        # Preface
        ("site_text.preface.heading", "안녕하세요, DArt-B 지도교수\n중앙대학교 경영학과 서용원 교수입니다.", "인사말 제목"),
        ("site_text.preface.body1", "데이터 분석은 이제 모든 분야에서 필수적인 역량이 되었습니다. 특히 비즈니스 환경에서는 데이터를 통해 인사이트를 발견하고, 이를 바탕으로 전략적 의사결정을 내리는 능력이 무엇보다 중요합니다.", "인사말 1단락"),
        ("site_text.preface.body2", "DArt-B는 단순히 데이터 분석 기법을 배우는 것을 넘어서, 비즈니스 맥락에서 데이터를 이해하고 활용할 수 있는 실무진을 양성하는 것을 목표로 합니다. 이론과 실습을 균형있게 배우며, 실제 프로젝트를 통해 경험을 쌓아가는 과정에서 여러분들이 데이터 분석 전문가로 성장할 수 있을 것입니다.", "인사말 2단락"),
        ("site_text.preface.body3", "학회 활동을 통해 동료들과 함께 배우고 성장하며, 데이터 분석에 대한 열정을 키워나가시기 바랍니다. 앞으로의 여정에서 큰 성과를 거두시길 응원합니다.", "인사말 3단락"),
        # Networking
        ("site_text.networking.title", "DArt-B의 밤", "네트워킹 이벤트 제목"),
        ("site_text.networking.intro", "학회원들 간의 친목을 도모하고 네트워킹을 강화하는 DArt-B만의 특별한 이벤트입니다. 학술적 교류를 넘어 진정한 공동체 문화를 만들어갑니다.", "네트워킹 소개"),
        ("site_text.networking.section1.title", "따뜻한 만남의 시간", "네트워킹 섹션 1 제목"),
        ("site_text.networking.section1.body", "DArt-B의 밤은 학기마다 개최되는 네트워킹 이벤트로, 학회원들이 학업과 프로젝트를 넘어 개인적인 관계를 형성할 수 있는 소중한 시간입니다. 편안한 분위기에서 선배와 후배, 동기들과 깊이 있는 대화를 나누며 진정한 공동체를 만들어갑니다.", "네트워킹 섹션 1 내용"),
        ("site_text.networking.section2.title", "다양한 활동과 교류", "네트워킹 섹션 2 제목"),
        ("site_text.networking.section2.body", "다양한 게임과 활동을 통해 서로를 더 잘 알아가는 시간을 가집니다. 팀 빌딩 활동, 퀴즈 대회, 토크 세션 등을 통해 자연스럽게 소통하며, 학회 생활에서 얻기 힘든 특별한 추억을 만들어갑니다.", "네트워킹 섹션 2 내용"),
        ("site_text.networking.section3.title", "지속적인 유대 관계", "네트워킹 섹션 3 제목"),
        ("site_text.networking.section3.body", "DArt-B의 밤을 통해 형성된 인맥과 관계는 학회 활동을 넘어 평생의 자산이 됩니다. 데이터 분석이라는 공통 관심사를 가진 동료들과의 깊은 유대는 향후 커리어에도 큰 도움이 되며, 서로의 성장을 응원하는 든든한 네트워크가 됩니다.", "네트워킹 섹션 3 내용"),
        ("site_text.networking.highlight.title", "6기부터 시작된 새로운 전통", "네트워킹 하이라이트 제목"),
        ("site_text.networking.highlight.body", "DArt-B의 밤은 6기 운영진이 기획하고 시작한 특별한 이벤트입니다. 학회의 새로운 전통으로 자리잡으며, 앞으로도 계속해서 발전시켜 나갈 예정입니다.", "네트워킹 하이라이트 내용"),
    ]

    for key, value, description in site_texts_defaults:
        existing = db.query(Setting).filter(Setting.key == key).first()
        if not existing:
            setting = Setting(key=key, value=value, description=description)
            db.add(setting)

    # 데이터톤 항목 초기 설정 (없는 경우만)
    import json as _json
    datathon_key = "datathon.entries"
    if not db.query(Setting).filter(Setting.key == datathon_key).first():
        default_datathons = _json.dumps([
            {
                "id": "1",
                "title": "앵날다쏘 (중앙대 DArt-B x 서강대 Parrot)",
                "date": "2024.11",
                "description": "중앙대학교 DArt-B와 서강대학교 Parrot이 함께하는 연합 해커톤으로, 실제 기업 데이터를 활용한 과제를 해결합니다.",
                "imageKey": "datathon.angnal",
                "latest": True,
                "participants": "15개 팀",
                "achievement": "DArt-B 팀 성과: 우수상 수상"
            },
            {
                "id": "2",
                "title": "아러다 (중앙대 DArt-B x 중앙대 CUAI)",
                "date": "2024.08",
                "description": "중앙대학교 데이터 분석 학회 DArt-B와 인공지능 학회 CUAI가 진행하는 해커톤으로, 데이터 분석과 AI 기술의 융합을 경험합니다.",
                "imageKey": "datathon.aruda",
                "latest": False,
                "participants": "15개 팀",
                "achievement": "DArt-B 팀 성과: 우수상 수상"
            },
            {
                "id": "3",
                "title": "쿠쿠다트 (중앙대 DArt-B x 경희대 KHUDA)",
                "date": "2024.05",
                "description": "중앙대학교와 경희대학교의 데이터톤으로, 두 대학의 데이터 분석 학회가 함께하여 다양한 분야의 데이터 분석 경험을 제공합니다.",
                "imageKey": "datathon.kukudart",
                "latest": False,
                "participants": "15개 팀",
                "achievement": "DArt-B 팀 성과: 우수상 수상"
            }
        ], ensure_ascii=False)
        db.add(Setting(key=datathon_key, value=default_datathons, description="데이터톤 연혁 항목 (JSON)"))

    # 연혁 (About Us history)
    history_key = "about.history"
    if not db.query(Setting).filter(Setting.key == history_key).first():
        db.add(Setting(key=history_key, value=_json.dumps([
            {"id": "1", "year": "2019", "title": "1기 창립", "description": "중앙대학교 경영학부 데이터 분석 학회 DArt-B 창립"},
            {"id": "2", "year": "2020", "title": "2기-3기 활동", "description": "온라인 세션 도입 및 정규 커리큘럼 체계화"},
            {"id": "3", "year": "2021", "title": "4기-5기 활동", "description": "연합 데이터톤 참여 시작 및 대외 활동 확대"},
            {"id": "4", "year": "2024", "title": "6기 현재", "description": "DArt-B의 밤 네트워킹 이벤트 신설 및 웹사이트 구축"},
        ], ensure_ascii=False), description="연혁 항목 (JSON)"))

    # 커리큘럼 항목
    curriculum_key = "curriculum.items"
    if not db.query(Setting).filter(Setting.key == curriculum_key).first():
        db.add(Setting(key=curriculum_key, value=_json.dumps([
            {"id": "1", "title": "토이프로젝트", "description": "학기 중 진행되는 토이프로젝트를 통해 실제 데이터를 활용한 분석 경험을 쌓습니다. 팀 단위로 진행되며, 기획부터 분석, 발표까지 전 과정을 경험할 수 있습니다.", "imageKey": "curriculum.assignment"},
            {"id": "2", "title": "학술제", "description": "매 학기 말에 진행되는 학술제에서는 한 학기 동안의 학습 성과를 발표합니다. 개인 또는 팀 프로젝트를 통해 실무 역량을 기르고, 발표 경험을 쌓을 수 있습니다.", "imageKey": "curriculum.study"},
            {"id": "3", "title": "지도교수님/연사 특강", "description": "지도교수님과 외부 전문가를 모신 특강을 통해 최신 트렌드와 실무 노하우를 학습합니다. 이론과 실무를 연결하는 소중한 기회입니다.", "imageKey": "home.curriculum.session"},
        ], ensure_ascii=False), description="커리큘럼 활동 항목 (JSON)"))

    # 모집 FAQ
    faq_key = "recruiting.faq"
    if not db.query(Setting).filter(Setting.key == faq_key).first():
        db.add(Setting(key=faq_key, value=_json.dumps([
            {"id": "1", "question": "DArt-B 지원 자격이 어떻게 되나요?", "answer": "중앙대학교 재학생이면 학과 제한 없이 누구나 지원 가능합니다."},
            {"id": "2", "question": "프로그래밍 경험이 없어도 지원할 수 있나요?", "answer": "네, 가능합니다. 기초부터 체계적으로 학습할 수 있는 커리큘럼을 제공합니다."},
            {"id": "3", "question": "학회 활동 시간은 어떻게 되나요?", "answer": "매주 화요일 오후 7시에 정규 세션이 있으며, 스터디는 팀별로 조정합니다."},
            {"id": "4", "question": "학회비는 얼마인가요?", "answer": "학기당 5만원이며, 교재비와 네트워킹 이벤트 비용이 포함됩니다."},
        ], ensure_ascii=False), description="모집 FAQ 항목 (JSON)"))

    db.commit()
    db.close()


@app.get("/")
def read_root():
    return {"message": "DArt-B Backend is Online"}


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}


# ==================== 인증 관련 API ====================

@app.post("/api/v1/auth/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """관리자 로그인"""
    admin = db.query(Admin).filter(Admin.username == form_data.username).first()
    
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive admin account"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/v1/auth/login/json", response_model=Token)
async def login_json(
    login_data: AdminLogin,
    db: Session = Depends(get_db)
):
    """관리자 로그인 (JSON 형식)"""
    admin = db.query(Admin).filter(Admin.username == login_data.username).first()
    
    if not admin or not verify_password(login_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive admin account"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/v1/auth/me", response_model=AdminResponse)
async def get_current_user_info(current_admin: Admin = Depends(get_current_admin)):
    """현재 로그인한 관리자 정보"""
    return current_admin


@app.post("/api/v1/auth/register", response_model=AdminResponse)
async def register_admin(
    admin_data: AdminCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """새 관리자 계정 생성 (관리자만 가능)"""
    # 중복 확인
    existing_admin = db.query(Admin).filter(Admin.username == admin_data.username).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    new_admin = Admin(
        username=admin_data.username,
        email=admin_data.email,
        hashed_password=get_password_hash(admin_data.password),
        is_active=True
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return new_admin


# ==================== 멤버 관리 API ====================

@app.get("/api/v1/members", response_model=List[MemberResponse])
async def get_members(
    generation: Optional[int] = None,
    is_executive: Optional[bool] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """멤버 목록 조회"""
    query = db.query(Member)
    
    if generation is not None:
        query = query.filter(Member.generation == generation)
    if is_executive is not None:
        query = query.filter(Member.is_executive == is_executive)
    if is_active is not None:
        query = query.filter(Member.is_active == is_active)
    
    members = query.order_by(Member.generation.desc(), Member.name).all()
    return members


@app.get("/api/v1/members/{member_id}", response_model=MemberResponse)
async def get_member(member_id: int, db: Session = Depends(get_db)):
    """특정 멤버 조회"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    return member


@app.post("/api/v1/members", response_model=MemberResponse)
async def create_member(
    member_data: MemberCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """새 멤버 추가 (관리자만 가능)"""
    try:
        # Pydantic v2 호환성
        member_dict = member_data.model_dump() if hasattr(member_data, 'model_dump') else member_data.dict()
        member = Member(**member_dict)
        db.add(member)
        db.commit()
        db.refresh(member)
        return member
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"멤버 추가 실패: {str(e)}"
        )


@app.put("/api/v1/members/{member_id}", response_model=MemberResponse)
async def update_member(
    member_id: int,
    member_data: MemberUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """멤버 정보 수정 (관리자만 가능)"""
    try:
        member = db.query(Member).filter(Member.id == member_id).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found"
            )
        
        # Pydantic v2 호환성
        if hasattr(member_data, 'model_dump'):
            update_data = member_data.model_dump(exclude_unset=True)
        else:
            update_data = member_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(member, field, value)
        
        db.commit()
        db.refresh(member)
        return member
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"멤버 수정 실패: {str(e)}"
        )


@app.delete("/api/v1/members/{member_id}")
async def delete_member(
    member_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """멤버 삭제 (관리자만 가능)"""
    try:
        member = db.query(Member).filter(Member.id == member_id).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found"
            )
        
        db.delete(member)
        db.commit()
        return {"message": "Member deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"멤버 삭제 실패: {str(e)}"
        )


# ==================== PDF 업로드 API ====================

@app.post("/api/v1/members/upload-pdf", response_model=PDFUploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """PDF 파일 업로드 및 멤버 정보 파싱 (관리자만 가능)"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    pdf_content = await file.read()
    
    try:
        # PDF 파싱
        parsed_members = parse_pdf(pdf_content)
        
        members_created = 0
        members_updated = 0
        
        for member_data in parsed_members:
            # 이름과 기수가 필수
            if not member_data.get("name") or not member_data.get("generation"):
                continue
            
            # 기존 멤버 확인 (이름과 기수로)
            existing_member = db.query(Member).filter(
                Member.name == member_data["name"],
                Member.generation == member_data["generation"]
            ).first()
            
            if existing_member:
                # 업데이트
                for key, value in member_data.items():
                    if value and hasattr(existing_member, key):
                        setattr(existing_member, key, value)
                members_updated += 1
            else:
                # 새로 생성
                new_member = Member(**member_data)
                db.add(new_member)
                members_created += 1
        
        db.commit()
        
        return PDFUploadResponse(
            message="PDF processed successfully",
            members_created=members_created,
            members_updated=members_updated
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"PDF parsing error: {str(e)}"
        )


# ==================== One-Click Google Sheets Sync API ====================

@app.get("/api/v1/sync/status")
async def get_sync_status():
    """Get Google Sheets sync configuration status"""
    return {
        "configured": settings.has_google_sheets_config,
        "sheet_id_set": bool(settings.GOOGLE_SHEETS_ID),
        "service_account_set": bool(settings.GOOGLE_SERVICE_ACCOUNT_JSON),
        "api_key_set": bool(settings.GOOGLE_API_KEY),
    }


@app.post("/api/v1/sync/members")
async def one_click_sync_members(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    One-click member sync from Google Sheets.
    Uses environment variables for configuration (no credentials needed in request).
    """
    if not settings.GOOGLE_SHEETS_ID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Sheets ID not configured. Set GOOGLE_SHEETS_ID environment variable."
        )

    try:
        # Try Service Account first, then fall back to API key
        if settings.GOOGLE_SERVICE_ACCOUNT_JSON:
            print("Using Service Account authentication...")
            members_data = await sync_with_service_account(settings.GOOGLE_SHEETS_ID)
        elif settings.GOOGLE_API_KEY:
            print("Using API key authentication...")
            members_data = await sync_from_google_sheet(
                settings.GOOGLE_SHEETS_ID,
                settings.GOOGLE_API_KEY
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No authentication configured. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_API_KEY."
            )

        if not members_data:
            return {
                "success": True,
                "message": "No members found in the sheet",
                "count": 0,
                "created": 0,
                "updated": 0
            }

        members_created = 0
        members_updated = 0

        for member_data in members_data:
            if not member_data.get("name") or not member_data.get("generation"):
                continue

            # Check for existing member by name and generation
            existing_member = db.query(Member).filter(
                Member.name == member_data["name"],
                Member.generation == member_data["generation"]
            ).first()

            if existing_member:
                # Update existing member
                for key, value in member_data.items():
                    if value is not None and value != "" and hasattr(existing_member, key):
                        setattr(existing_member, key, value)
                members_updated += 1
            else:
                # Create new member
                try:
                    new_member = Member(**member_data)
                    db.add(new_member)
                    members_created += 1
                except Exception as e:
                    print(f"Error creating member {member_data.get('name')}: {e}")
                    continue

        db.commit()

        return {
            "success": True,
            "message": f"Sync complete: {members_created} created, {members_updated} updated",
            "count": members_created + members_updated,
            "created": members_created,
            "updated": members_updated
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync failed: {str(e)}"
        )


# ==================== 파일 업로드 API ====================

@app.post("/api/v1/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    category: str = Form("general"),
    custom_filename: Optional[str] = Form(None),
    current_admin: Admin = Depends(get_current_admin)
):
    """이미지 파일 업로드 (관리자만 가능)"""
    try:
        file_url = await save_uploaded_file(file, category, custom_filename)
        return {
            "message": "File uploaded successfully",
            "url": file_url,
            "filename": file.filename
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Upload error: {str(e)}"
        )


@app.get("/api/v1/upload/images")
async def list_uploaded_images(
    category: str = "general",
    current_admin: Admin = Depends(get_current_admin)
):
    """업로드된 이미지 목록 조회 (관리자만 가능)"""
    try:
        files = get_file_list(category)
        return {
            "category": category,
            "files": files,
            "count": len(files)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error listing files: {str(e)}"
        )


@app.delete("/api/v1/upload/image")
async def delete_uploaded_image(
    file_path: str = Form(...),
    current_admin: Admin = Depends(get_current_admin)
):
    """업로드된 이미지 삭제 (관리자만 가능)"""
    try:
        success = delete_file(file_path)
        if success:
            return {"message": "File deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Delete error: {str(e)}"
        )


# ==================== 설정 API ====================

@app.get("/api/v1/settings/{key}")
async def get_setting(key: str, db: Session = Depends(get_db)):
    """설정 값 조회"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Setting '{key}' not found"
        )
    return {"key": setting.key, "value": setting.value}


@app.put("/api/v1/settings/{key}")
async def update_setting(
    key: str,
    value: str = Form(...),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """설정 값 업데이트 (관리자만 가능)"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        # 새 설정 생성
        setting = Setting(key=key, value=value)
        db.add(setting)
    else:
        setting.value = value
    
    db.commit()
    db.refresh(setting)
    return {"key": setting.key, "value": setting.value, "message": "Setting updated successfully"}


# ==================== 사이트 이미지 관리 API ====================

@app.get("/api/v1/site-images")
async def get_all_site_images(db: Session = Depends(get_db)):
    """모든 사이트 이미지 조회 (site_image.* 설정)"""
    settings_list = db.query(Setting).filter(
        Setting.key.like("site_image.%")
    ).all()

    # key에서 'site_image.' 접두사 제거하여 맵 형태로 반환
    return {
        setting.key.replace("site_image.", ""): {
            "url": setting.value,
            "description": setting.description or ""
        }
        for setting in settings_list
    }


@app.put("/api/v1/site-images/{key:path}")
async def update_site_image(
    key: str,
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    사이트 이미지 업데이트
    - file: 새 이미지 업로드 (선택)
    - url: 외부 URL 직접 입력 (선택)
    둘 중 하나 필수
    """
    full_key = f"site_image.{key}"

    if file and file.filename:
        # 이미지 업로드
        # 파일명에서 확장자 분리 및 key 기반 파일명 생성
        safe_key = key.replace(".", "_").replace("/", "_")
        file_url = await save_uploaded_file(file, "images", f"site_{safe_key}")
        final_url = file_url
    elif url:
        final_url = url
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="file 또는 url이 필요합니다."
        )

    # 설정 업데이트/생성
    setting = db.query(Setting).filter(Setting.key == full_key).first()
    if setting:
        setting.value = final_url
    else:
        setting = Setting(key=full_key, value=final_url)
        db.add(setting)

    db.commit()
    db.refresh(setting)

    return {
        "key": key,
        "url": final_url,
        "message": "이미지가 업데이트되었습니다."
    }


@app.post("/api/v1/upload/logo")
async def upload_logo(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """로고 업로드 및 설정 업데이트 (관리자만 가능)"""
    try:
        # 로고 업로드 (logo-white라는 이름으로 저장)
        file_url = await save_uploaded_file(file, "logos", "logo-white")
        
        # 설정 업데이트
        setting = db.query(Setting).filter(Setting.key == "logo_white").first()
        if setting:
            setting.value = file_url
        else:
            setting = Setting(
                key="logo_white",
                value=file_url,
                description="헤더 및 푸터에 사용되는 흰색 로고"
            )
            db.add(setting)
        
        db.commit()
        
        return {
            "message": "Logo uploaded and updated successfully",
            "url": file_url
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Upload error: {str(e)}"
        )
