# Google Sheets Member Sync - Implementation Report

## Overview

This document describes the one-click Google Sheets sync feature for DArt-B member management.

---

## Data Flow Architecture

### Before Changes (Manual Sync)

```
┌─────────────────┐     Manual Input     ┌─────────────────┐
│  Google Sheet   │ ──────────────────▶  │    AdminPage    │
│  (Member Data)  │   (Sheet ID + API    │   (Frontend)    │
└─────────────────┘      Key each time)  └────────┬────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │ POST /api/v1/   │
                                         │ members/sync-   │
                                         │ google-form     │
                                         └────────┬────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │    SQLite DB    │
                                         │   (dartb.db)    │
                                         └─────────────────┘
```

**Issues:**
- User must enter Sheet ID and API key every time
- Credentials exposed in frontend
- Not suitable for automated/scheduled sync

---

### After Changes (One-Click Sync)

```
┌─────────────────┐                      ┌─────────────────┐
│  Google Sheet   │ ◀──── Shared with ── │ Service Account │
│  (Member Data)  │      service email   │  (credentials)  │
└────────┬────────┘                      └────────┬────────┘
         │                                        │
         │ Google Sheets API v4                   │
         ▼                                        ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Server                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Environment Variables                                │    │
│  │  - GOOGLE_SHEETS_ID                                  │    │
│  │  - GOOGLE_SERVICE_ACCOUNT_JSON                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  POST /api/v1/sync/members                            │   │
│  │  - Authenticates with Service Account JWT            │   │
│  │  - Fetches sheet data                                 │   │
│  │  - Parses member fields                               │   │
│  │  - Downloads Google Drive images                      │   │
│  │  - Updates/Creates members in DB                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│    SQLite DB    │ ◀─── │   AdminPage     │
│   (dartb.db)    │      │ (Refresh list)  │
└─────────────────┘      └─────────────────┘
```

**Benefits:**
- Single click sync (no credentials needed per request)
- Server-side authentication (secure)
- Supports Service Account (recommended) or API key
- Can be extended for scheduled/automated sync

---

## Files Modified

| File | Changes |
|------|---------|
| `backend/google_forms.py` | Added Service Account authentication, JWT token generation |
| `backend/settings.py` | Added GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_API_KEY |
| `backend/main.py` | Added `/api/v1/sync/status` and `/api/v1/sync/members` endpoints |
| `backend/.env.example` | Added Google Sheets configuration section |
| `frontend/src/api.ts` | Added `syncApi` with `getStatus()` and `syncMembers()` |
| `frontend/components/pages/AdminPage.tsx` | Added Quick Sync button |

---

## API Endpoints

### GET /api/v1/sync/status

Returns the Google Sheets sync configuration status.

**Response:**
```json
{
  "configured": true,
  "sheet_id_set": true,
  "service_account_set": true,
  "api_key_set": false
}
```

### POST /api/v1/sync/members

One-click sync members from Google Sheets. Requires admin authentication.

**Response:**
```json
{
  "success": true,
  "message": "Sync complete: 5 created, 12 updated",
  "count": 17,
  "created": 5,
  "updated": 12
}
```

---

## Configuration Guide

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Create Service Account (Recommended)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in:
   - Service account name: `dartb-sheets-sync`
   - Description: `DArt-B Website member sync`
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

### Step 3: Generate Service Account Key

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" format
5. Save the downloaded file securely

### Step 4: Share Google Sheet

1. Open your Google Sheet with member data
2. Click "Share" button
3. Add the service account email (found in the JSON file as `client_email`)
4. Give "Viewer" permission
5. Click "Share"

### Step 5: Configure Environment Variables

In `backend/.env`:

```env
# Get Sheet ID from URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

# Path to the downloaded JSON file
GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/service-account.json

# OR inline JSON (useful for Docker/environment variables)
# GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

---

## Google Sheet Format

The sheet should have the following columns (Korean field names supported):

| Column | Description | Required |
|--------|-------------|----------|
| 기수를 선택해주세요 | Generation number (e.g., "5기") | Yes |
| 이름을 입력해주세요 | Member name | Yes |
| 전공을 학부형식으로 작성해주세요 | Major/Department | No |
| 운영진으로 활동한 경우... | Position/Role | No |
| 프로필에 올라갈 사진... | Profile image (Google Drive link) | No |
| 링크드인 프로필 주소... | LinkedIn URL | No |
| 깃허브 주소... | GitHub URL | No |
| 인스타그램 프로필 ID... | Instagram handle | No |

---

## Usage

### Using the Quick Sync Button

1. Log in to the Admin page
2. If Google Sheets is configured, you'll see a green "Google Sheets 동기화" button
3. Click the button
4. Wait for sync to complete
5. Success message shows count of created/updated members
6. Member list automatically refreshes

### Manual Sync (Legacy)

The original manual sync is still available:
1. Click "구글 폼 동기화" button
2. Enter Sheet ID and API key
3. Click sync

---

## Security Considerations

- **Service Account credentials** are stored server-side only
- **API keys** are never exposed to the frontend for one-click sync
- **Admin authentication** is required for all sync operations
- **Sheet sharing** should be limited to the service account email

---

## Troubleshooting

### "Google Sheets ID not configured"

Set the `GOOGLE_SHEETS_ID` environment variable in `backend/.env`.

### "Access denied" error

1. Ensure the Google Sheet is shared with the service account email
2. Verify the service account JSON file path is correct
3. Check that Google Sheets API is enabled in Cloud Console

### "No members found"

1. Verify the sheet has data starting from row 2
2. Check that column headers match expected format
3. Ensure "기수" and "이름" columns have data

### Sync button not appearing

1. Check `GET /api/v1/sync/status` returns `configured: true`
2. Verify environment variables are set
3. Restart the backend server after changing `.env`

---

*Last updated: 2026-01-28*
