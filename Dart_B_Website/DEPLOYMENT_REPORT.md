# DArt-B Website - Production Deployment Report

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                       │
│                    Port: 5173 (dev) / 3000 (prod)                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  .env.production                                         │    │
│  │  VITE_API_BASE_URL=http://SERVER_IP:8000                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI + SQLite)                    │
│                    Port: 8000                                    │
│                    Host: 0.0.0.0 (all interfaces)               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  .env                                                    │    │
│  │  CORS_ORIGINS=http://SERVER_IP:3000                     │    │
│  │  HOST=0.0.0.0                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer     | Technology                      |
|-----------|--------------------------------|
| Frontend  | React 18 + TypeScript + Vite  |
| Styling   | Tailwind CSS v4               |
| Backend   | FastAPI + SQLAlchemy          |
| Database  | SQLite (file-based)           |
| Auth      | JWT (python-jose)             |

---

## Problems Found & Fixed

### 1. Hardcoded localhost URLs (CRITICAL)

**Problem:** Frontend `api.ts` had hardcoded `http://localhost:8000` in 4 locations:
- Line 1: `API_BASE_URL` constant
- Line 149: Error message
- Lines 387, 394, 401: `getImageUrl()` function

**Fix:** Replaced with dynamic environment variable loading:
```typescript
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  return envUrl ? `${envUrl}/api/v1` : 'http://localhost:8000/api/v1';
};
```

### 2. CORS Only Allowed localhost (CRITICAL)

**Problem:** Backend `main.py` CORS middleware only allowed:
- `http://localhost:5173`
- `http://localhost:3000`

**Fix:** CORS origins now loaded from environment variable:
```python
# From settings.py
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
```

### 3. No Environment Variable Support

**Problem:** No `.env` files or environment variable infrastructure existed.

**Fix:** Created complete environment configuration:
- `frontend/.env.example` - Frontend API URL
- `frontend/.env.development` - Dev defaults
- `backend/.env.example` - All backend settings
- `frontend/vite.config.ts` - Vite env support
- `frontend/src/vite-env.d.ts` - TypeScript declarations
- `backend/settings.py` - Centralized settings class

### 4. Backend Host Binding

**Problem:** uvicorn default binding is `127.0.0.1` (localhost only), blocking external access.

**Fix:**
- Production scripts use `--host 0.0.0.0`
- Settings default `HOST=0.0.0.0` for production

### 5. Missing Deployment Documentation

**Problem:** README only had local development instructions.

**Fix:** Added comprehensive deployment section with:
- Quick deploy script
- Manual deployment steps
- Nginx configuration
- systemd service setup
- Troubleshooting guide

---

## Files Created

| File | Purpose |
|------|---------|
| `frontend/.env.example` | Template for frontend environment |
| `frontend/.env.development` | Development defaults |
| `frontend/vite.config.ts` | Vite configuration with host binding |
| `frontend/src/vite-env.d.ts` | TypeScript env declarations |
| `backend/.env.example` | Template for backend environment |
| `scripts/start-backend.sh` | Backend startup script |
| `scripts/start-frontend.sh` | Frontend startup script |
| `scripts/deploy.sh` | Automated deployment script |
| `.gitignore` | Exclude env files and artifacts |
| `DEPLOYMENT_REPORT.md` | This report |

## Files Modified

| File | Changes |
|------|---------|
| `frontend/src/api.ts` | Environment variable support for API URL |
| `backend/main.py` | CORS from settings, settings import |
| `backend/auth.py` | Use settings for security config |
| `backend/settings.py` | Complete rewrite with env support |
| `backend/requirements.txt` | Added python-dotenv |
| `README.md` | Added deployment documentation |

---

## How to Deploy on EC2

### Quick Start (Automated)

```bash
# 1. Clone and navigate to project
git clone <repository-url>
cd Dart_B_Website

# 2. Run deployment script with your server IP
./scripts/deploy.sh YOUR_EC2_PUBLIC_IP

# 3. Start backend (Terminal 1)
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000

# 4. Start frontend (Terminal 2)
cd frontend
npx serve dist -s -l 3000

# 5. Open firewall
sudo ufw allow 8000
sudo ufw allow 3000
```

### Access Points

- **Frontend:** `http://YOUR_EC2_IP:3000`
- **Backend API:** `http://YOUR_EC2_IP:8000`
- **API Docs:** `http://YOUR_EC2_IP:8000/docs`
- **Admin Login:** Username: `admin`, Password: `admin123`

### Security Checklist

- [ ] Change default admin password after first login
- [ ] Set strong `SECRET_KEY` in backend `.env`
- [ ] Configure HTTPS with SSL certificate
- [ ] Restrict SSH access to your IP only
- [ ] Set up regular database backups

---

## Environment Variables Reference

### Frontend (`frontend/.env.production`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend server URL | `http://123.45.67.89:8000` |

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Server bind address | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:5173` |
| `SECRET_KEY` | JWT signing key | (random) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `1440` (24h) |
| `DATABASE_URL` | Database connection | `sqlite:///./dartb.db` |
| `DEBUG` | Debug mode | `false` |

---

*Report generated: 2026-01-28*
