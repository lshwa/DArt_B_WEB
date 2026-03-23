# Google Sheets Member Sync Guide

## Overview

This document describes the one-click member sync feature that fetches member data from Google Sheets and updates the local database.

---

## Current Member Data Flow (Before Sync)

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Manual Entry (Admin Form)                                    │
│  2. PDF Upload (Parsed automatically)                            │
│  3. Google Sheets (Form responses)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                             │
│  • POST /api/v1/members - Create member                          │
│  • POST /api/v1/members/upload-pdf - PDF parsing                 │
│  • POST /api/v1/sync/members - Google Sheets sync                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SQLite Database                               │
│                    (backend/dartb.db)                            │
│                                                                  │
│  Table: members                                                  │
│  ├── id (PK)                                                     │
│  ├── name                                                        │
│  ├── generation                                                  │
│  ├── position                                                    │
│  ├── major                                                       │
│  ├── profile_image_url                                           │
│  ├── github, linkedin, instagram                                 │
│  ├── is_executive, is_active                                     │
│  └── created_at, updated_at                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
│  • GET /api/v1/members → Display in Members page                 │
│  • AdminPage → CRUD operations                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Google Sheets API Integration

### Environment Variables

The backend reads these from `.env`:

| Variable | Description |
|----------|-------------|
| `GOOGLE_SHEETS_ID` | The spreadsheet ID from the Google Sheets URL |
| `GOOGLE_SHEETS_API_KEY` | Google API key with Sheets API enabled |

**Note:** The backend also supports `GOOGLE_API_KEY` as an alternative name.

### How to Get These Values

1. **GOOGLE_SHEETS_ID**:
   - Open your Google Sheet
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
   - Copy the `SHEET_ID` portion

2. **GOOGLE_SHEETS_API_KEY**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project or select existing one
   - Enable "Google Sheets API"
   - Go to Credentials → Create API Key
   - (Recommended) Restrict the key to Google Sheets API only

---

## Local Sync Pipeline

### Architecture

```
┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│     Frontend       │     │      Backend       │     │   Google Sheets    │
│  localhost:5173    │────▶│   localhost:8000   │────▶│   API v4           │
└────────────────────┘     └────────────────────┘     └────────────────────┘
         │                          │                          │
         │  POST /api/v1/sync/      │  GET spreadsheets/       │
         │      members             │      {id}/values         │
         │                          │                          │
         │◀─────────────────────────│◀─────────────────────────│
         │  { success, count,       │  { values: [[...]] }     │
         │    created, updated }    │                          │
```

### Sync Flow (Step-by-Step)

1. **User clicks "Sync Members from Google Sheets"** in AdminPage
2. **Frontend calls** `POST http://localhost:8000/api/v1/sync/members`
3. **Backend authenticates** using JWT token from localStorage
4. **Backend fetches** Google Sheets data using API key:
   ```
   GET https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/A1:Z1000?key={API_KEY}
   ```
5. **Backend parses** each row into member objects:
   - Maps Korean form field names to database columns
   - Downloads profile images from Google Drive links
   - Validates required fields (name, generation)
6. **Backend updates database**:
   - If member exists (matched by name + generation): UPDATE
   - If member is new: CREATE
7. **Backend returns** sync results:
   ```json
   {
     "success": true,
     "message": "Sync complete: 5 created, 3 updated",
     "count": 8,
     "created": 5,
     "updated": 3
   }
   ```
8. **Frontend shows** success message and refreshes member list

---

## How to Run Locally

### 1. Start Backend (Terminal 1)

```bash
cd backend

# Create virtual environment (first time only)
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be available at: `http://localhost:8000`

### 2. Start Frontend (Terminal 2)

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 3. Verify Configuration

1. Open `http://localhost:8000/api/v1/sync/status`
2. You should see:
   ```json
   {
     "configured": true,
     "sheet_id_set": true,
     "service_account_set": false,
     "api_key_set": true
   }
   ```

---

## How to Use the Sync Button

### Prerequisites

1. Backend `.env` file contains:
   ```
   GOOGLE_SHEETS_ID=your_sheet_id_here
   GOOGLE_SHEETS_API_KEY=your_api_key_here
   ```

2. Google Sheet is shared publicly (at least "Anyone with the link can view")

3. Google Sheets API is enabled in your Google Cloud project

### Steps

1. Navigate to `http://localhost:5173`
2. Click "Admin" in the navigation
3. Log in with admin credentials (default: `admin` / `admin123`)
4. Look for the green **"Sync Members from Google Sheets"** button in the header
5. Click it to trigger sync
6. Wait for the loading spinner to complete
7. See the success message showing how many members were synced
8. The member table will automatically refresh

### Button States

| State | Appearance | Meaning |
|-------|------------|---------|
| Green | Configured | Ready to sync |
| Gray | Not configured | Missing env variables |
| Spinning | Syncing | Operation in progress |

---

## Expected Google Sheet Format

The sync expects a Google Sheet with these column headers (Korean):

| Column Header | Maps To | Required |
|--------------|---------|----------|
| 기수를 선택해주세요 | generation | Yes |
| 이름을 입력해주세요 | name | Yes |
| 전공을 학부형식으로 작성해주세요 | major | No |
| 운영진으로 활동한 경우... | position, is_executive | No |
| (선택) 프로필에 올라갈 사진... | profile_image_url | No |
| (선택) 링크드인 프로필 주소... | linkedin | No |
| (선택) 깃허브 주소... | github | No |
| (선택) 인스타그램 프로필 ID... | instagram | No |

---

## Troubleshooting

### "Google Sheets 동기화가 설정되지 않았습니다"

**Cause:** Missing environment variables

**Solution:**
1. Check `backend/.env` file exists
2. Verify it contains `GOOGLE_SHEETS_ID` and `GOOGLE_SHEETS_API_KEY`
3. Restart the backend server

### "시트를 찾을 수 없습니다"

**Cause:** Invalid Sheet ID or sheet not shared

**Solution:**
1. Verify the Sheet ID is correct (from URL)
2. Make sure the sheet is shared publicly or with the API key's project

### "Access denied" / 403 Error

**Cause:** API key issues or API not enabled

**Solution:**
1. Check API key is valid in Google Cloud Console
2. Ensure Google Sheets API is enabled
3. Check API key restrictions (if any)

### "Network error"

**Cause:** Backend not running or CORS issues

**Solution:**
1. Verify backend is running at `http://localhost:8000`
2. Check browser console for CORS errors
3. Ensure `http://localhost:5173` is in CORS_ORIGINS

---

## Security Notes

- API keys are stored server-side only (never exposed to frontend)
- All sync endpoints require admin authentication (JWT)
- CORS is configured to allow only local development origins
- This feature is optimized for **local development only**

---

## File Changes Summary

| File | Changes |
|------|---------|
| `backend/settings.py` | Added support for `GOOGLE_SHEETS_API_KEY` env variable |
| `frontend/components/pages/AdminPage.tsx` | Made sync button always visible with status indicators |

---

## API Reference

### GET /api/v1/sync/status

Check if Google Sheets sync is configured.

**Response:**
```json
{
  "configured": true,
  "sheet_id_set": true,
  "service_account_set": false,
  "api_key_set": true
}
```

### POST /api/v1/sync/members

Trigger one-click sync from Google Sheets.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Sync complete: 5 created, 3 updated",
  "count": 8,
  "created": 5,
  "updated": 3
}
```

**Response (Error):**
```json
{
  "detail": "Google Sheets ID not configured..."
}
```
