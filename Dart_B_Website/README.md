# DArt-B Website

> 📖 **상세 사용 가이드는 [USAGE_GUIDE.md](./USAGE_GUIDE.md)를 참고하세요.**
>
> 🔄 **Google Sheets 동기화 설정은 [GOOGLE_SHEETS_SYNC.md](./GOOGLE_SHEETS_SYNC.md)를 참고하세요.**

중앙대학교 데이터분석 학회 DArt-B의 공식 웹사이트입니다.

## 프로젝트 구조

```
Dart_B_Website/
├── backend/              # FastAPI 백엔드 서버
│   ├── main.py
│   ├── settings.py       # 환경 설정 (환경변수 지원)
│   ├── .env.example      # 환경 변수 예시
│   └── requirements.txt
├── frontend/             # React + Vite 프론트엔드
│   ├── src/
│   │   ├── api.ts        # API 클라이언트 (환경변수 지원)
│   │   └── vite-env.d.ts # TypeScript 환경변수 타입
│   ├── components/
│   ├── .env.example      # 환경 변수 예시
│   ├── vite.config.ts    # Vite 설정
│   └── package.json
├── scripts/              # 배포 스크립트
│   ├── start-backend.sh
│   ├── start-frontend.sh
│   └── deploy.sh
└── README.md
```

## 사전 요구사항

### Backend 요구사항
- Python 3.8 이상
- pip (Python 패키지 관리자)

### Frontend 요구사항
- Node.js 18.x 이상
- npm 또는 yarn

## 설치 및 실행 방법

### Backend 설정 및 실행

1. **프로젝트 디렉토리로 이동**
   ```bash
   cd Dart_B_Website/backend
   ```

2. **Python 가상환경 생성 (권장)**
   ```bash
   python -m venv venv
   ```

3. **가상환경 활성화**
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **의존성 패키지 설치**
   ```bash
   pip install -r requirements.txt
   ```

5. **서버 실행**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   서버가 실행되면 다음 주소에서 확인할 수 있습니다:
   - API 서버: http://localhost:8000
   - API 문서: http://localhost:8000/docs
   - 대체 문서: http://localhost:8000/redoc

### Frontend 설정 및 실행

1. **프로젝트 디렉토리로 이동**
   ```bash
   cd Dart_B_Website/frontend
   ```

2. **의존성 패키지 설치**
   ```bash
   npm install
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

   개발 서버가 실행되면 다음 주소에서 확인할 수 있습니다:
   - 프론트엔드: http://localhost:5173

4. **프로덕션 빌드 (선택사항)**
   ```bash
   npm run build
   ```

5. **프로덕션 빌드 미리보기 (선택사항)**
   ```bash
   npm run preview
   ```

---

## 서버 배포 (EC2 / Linux VM)

### 빠른 배포 (자동 스크립트)

1. **서버에 프로젝트 클론**
   ```bash
   git clone <repository-url>
   cd Dart_B_Website
   ```

2. **배포 스크립트 실행**
   ```bash
   # SERVER_IP에 실제 서버 IP 또는 도메인 입력
   ./scripts/deploy.sh YOUR_SERVER_IP
   ```

3. **서버 실행**
   ```bash
   # 터미널 1: 백엔드
   cd backend && source venv/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8000

   # 터미널 2: 프론트엔드
   cd frontend && npx serve dist -s -l 3000
   ```

### 수동 배포

#### 1. 백엔드 설정

```bash
cd backend

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
nano .env  # 아래 설정 수정
```

`.env` 파일 수정:
```env
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://YOUR_SERVER_IP:3000,https://your-domain.com
SECRET_KEY=your-random-secret-key-here
DEBUG=false
```

백엔드 실행:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 2. 프론트엔드 설정

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.production
nano .env.production  # 아래 설정 수정
```

`.env.production` 파일 수정:
```env
VITE_API_BASE_URL=http://YOUR_SERVER_IP:8000
```

프로덕션 빌드:
```bash
npm run build
```

빌드 파일 서빙:
```bash
# 방법 1: serve 패키지 사용
npx serve dist -s -l 3000

# 방법 2: Nginx 사용 (권장)
sudo cp -r dist/* /var/www/html/
```

#### 3. 방화벽 설정

```bash
# UFW 사용 시
sudo ufw allow 8000  # Backend API
sudo ufw allow 3000  # Frontend (또는 80/443)
sudo ufw enable

# AWS Security Group 사용 시
# EC2 콘솔에서 Inbound Rules에 8000, 3000 포트 추가
```

### Nginx 설정 (권장)

프로덕션 환경에서는 Nginx를 리버스 프록시로 사용하는 것을 권장합니다.

```nginx
# /etc/nginx/sites-available/dartb
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }
}
```

### systemd 서비스 (백그라운드 실행)

백엔드를 시스템 서비스로 등록:

```bash
# /etc/systemd/system/dartb-backend.service
[Unit]
Description=DArt-B Backend API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/Dart_B_Website/backend
Environment="PATH=/home/ubuntu/Dart_B_Website/backend/venv/bin"
ExecStart=/home/ubuntu/Dart_B_Website/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

서비스 활성화:
```bash
sudo systemctl daemon-reload
sudo systemctl enable dartb-backend
sudo systemctl start dartb-backend
sudo systemctl status dartb-backend
```

---

## 개발 환경 설정

### Backend 개발

백엔드는 FastAPI를 사용하며, CORS는 `http://localhost:3000`을 허용하도록 설정되어 있습니다. 프론트엔드가 다른 포트에서 실행되는 경우 `backend/main.py`의 CORS 설정을 수정해야 합니다.

### Frontend 개발

프론트엔드는 다음 기술 스택을 사용합니다:
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구 및 개발 서버
- **Tailwind CSS v4** - 스타일링
- **Framer Motion** - 애니메이션
- **Radix UI** - UI 컴포넌트
- **Lucide React** - 아이콘

## 주요 스크립트

### Frontend
- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드 생성
- `npm run preview` - 프로덕션 빌드 미리보기

### Backend
- `uvicorn main:app --reload` - 개발 서버 실행 (자동 리로드)
- `uvicorn main:app --reload --port 8000` - 포트 8000에서 실행

## 주요 기능

### 관리자 기능
- **관리자 로그인**: JWT 기반 인증 시스템
- **멤버 관리**: CRUD 작업 (생성, 조회, 수정, 삭제)
- **PDF 업로드**: PDF 파일에서 멤버 정보 자동 파싱 및 업데이트
- **구글 폼 연동**: 구글 시트에서 멤버 정보 동기화

### 데이터베이스
- SQLite 데이터베이스 사용 (개발 환경)
- 멤버 정보 저장 및 관리
- 관리자 계정 관리

## API 엔드포인트

### 인증
- `POST /api/v1/auth/login` - 관리자 로그인
- `POST /api/v1/auth/login/json` - 관리자 로그인 (JSON 형식)
- `GET /api/v1/auth/me` - 현재 로그인한 관리자 정보
- `POST /api/v1/auth/register` - 새 관리자 계정 생성

### 멤버 관리
- `GET /api/v1/members` - 멤버 목록 조회 (필터링 지원)
- `GET /api/v1/members/{id}` - 특정 멤버 조회
- `POST /api/v1/members` - 새 멤버 추가 (관리자만)
- `PUT /api/v1/members/{id}` - 멤버 정보 수정 (관리자만)
- `DELETE /api/v1/members/{id}` - 멤버 삭제 (관리자만)
- `POST /api/v1/members/upload-pdf` - PDF 파일 업로드 (관리자만)
- `POST /api/v1/members/sync-google-form` - 구글 폼 동기화 (관리자만)

### Health Check
- `GET /` - 서버 상태 확인
- `GET /api/v1/health` - 헬스 체크

## 기본 관리자 계정

서버를 처음 실행하면 자동으로 기본 관리자 계정이 생성됩니다:
- **사용자명**: `admin`
- **비밀번호**: `admin123`

⚠️ **보안**: 프로덕션 환경에서는 반드시 비밀번호를 변경하세요!

## 사용 방법

### 관리자 로그인
1. 웹사이트에서 "Admin Login" 버튼 클릭
2. 기본 계정으로 로그인 (admin / admin123)
3. 관리자 페이지에서 멤버 관리

### PDF 업로드
1. 관리자 페이지에서 "PDF 업로드" 버튼 클릭
2. 멤버 정보가 포함된 PDF 파일 선택
3. 업로드하면 자동으로 멤버 정보가 파싱되어 추가/업데이트됩니다

### 구글 폼 동기화
1. 관리자 페이지에서 "구글 폼 동기화" 버튼 클릭
2. 구글 시트 ID와 Google API 키 입력
3. 동기화하면 시트의 데이터가 멤버 정보로 업데이트됩니다

**구글 시트 설정 방법:**
- 구글 시트를 공개로 설정하거나
- Google Cloud Console에서 API 키 생성
- Sheets API 활성화 필요

## 문제 해결

### 로그인 오류 ("Failed to fetch")

**백엔드 서버가 실행되지 않은 경우:**
1. 백엔드 서버가 실행 중인지 확인:
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```
2. 브라우저에서 직접 확인:
   - http://localhost:8000/api/v1/health 접속
   - `{"status": "ok"}` 응답이 나와야 합니다

**CORS 오류가 발생하는 경우:**
- 백엔드의 `main.py`에서 CORS 설정 확인
- 프론트엔드 포트가 `http://localhost:5173`인지 확인

**포트가 이미 사용 중인 경우:**
```bash
# 다른 포트로 실행
uvicorn main:app --reload --port 8001
```
그리고 `frontend/src/api.ts`의 `API_BASE_URL`을 수정:
```typescript
const API_BASE_URL = 'http://localhost:8001/api/v1';
```

**패키지 설치 오류:**
```bash
# pip 업그레이드
pip install --upgrade pip
pip install -r requirements.txt
```

**데이터베이스 초기화:**
```bash
# 데이터베이스 파일 삭제 후 재시작
rm backend/dartb.db
# 서버 재시작 시 자동으로 재생성됩니다
```

**인증 오류:**
- 토큰이 만료된 경우 다시 로그인하세요
- 브라우저의 localStorage를 확인하세요

### Frontend 관련

**포트가 이미 사용 중인 경우:**
Vite는 자동으로 사용 가능한 포트를 찾습니다. 또는 `vite.config.js`에서 포트를 지정할 수 있습니다.

**의존성 설치 오류:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

**Tailwind CSS 스타일이 적용되지 않는 경우:**
- `globals.css`에 `@import 'tailwindcss';`가 포함되어 있는지 확인
- `postcss.config.js`에 `@tailwindcss/postcss` 플러그인이 설정되어 있는지 확인
- 개발 서버를 재시작

## 배포 문제 해결

### CORS 오류

프론트엔드에서 API 호출 시 CORS 오류가 발생하는 경우:

1. 백엔드 `.env` 파일의 `CORS_ORIGINS`에 프론트엔드 URL이 포함되어 있는지 확인
2. 프론트엔드 URL은 프로토콜(http/https)과 포트까지 정확히 입력
3. 예: `CORS_ORIGINS=http://123.45.67.89:3000,https://dartb.com`

### 외부에서 접속 불가

1. 백엔드가 `0.0.0.0`으로 바인딩되어 있는지 확인 (`127.0.0.1`이면 외부 접속 불가)
2. 방화벽에서 포트 8000, 3000이 열려 있는지 확인
3. AWS EC2의 경우 Security Group Inbound Rules 확인

### API 연결 오류

1. 프론트엔드 `.env.production`의 `VITE_API_BASE_URL`이 올바른지 확인
2. 백엔드 서버가 실행 중인지 확인: `curl http://YOUR_SERVER_IP:8000/api/v1/health`
3. 빌드 후 변경사항 반영: 환경변수 변경 시 반드시 `npm run build` 재실행

### 정적 파일 (이미지) 로드 오류

1. 백엔드 `/uploads` 폴더 권한 확인: `chmod -R 755 backend/uploads`
2. Nginx 사용 시 `/uploads/` 프록시 설정 확인

## 라이선스

이 프로젝트는 DArt-B의 소유입니다.

## 문의

- 이메일: dartbofficial@naver.com
- 교수님: 서용원 교수님 (중앙대학교 경영학부)

