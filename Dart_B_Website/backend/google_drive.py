import httpx
import json
import time
import base64
import os
import re
from typing import List, Dict, Optional


def get_service_account_credentials() -> Optional[Dict]:
    creds_path = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not creds_path:
        return None
    if creds_path.startswith("{"):
        try:
            return json.loads(creds_path)
        except json.JSONDecodeError:
            return None
    try:
        with open(creds_path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


async def get_drive_access_token(credentials: Dict) -> Optional[str]:
    from cryptography.hazmat.primitives import serialization, hashes
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.backends import default_backend

    try:
        header = {"alg": "RS256", "typ": "JWT"}
        now = int(time.time())
        claims = {
            "iss": credentials["client_email"],
            "scope": "https://www.googleapis.com/auth/drive.readonly",
            "aud": "https://oauth2.googleapis.com/token",
            "iat": now,
            "exp": now + 3600,
        }

        def b64(data: bytes) -> str:
            return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

        header_b64 = b64(json.dumps(header).encode())
        claims_b64 = b64(json.dumps(claims).encode())
        message = f"{header_b64}.{claims_b64}".encode()

        private_key = serialization.load_pem_private_key(
            credentials["private_key"].encode(),
            password=None,
            backend=default_backend(),
        )
        sig = private_key.sign(message, padding.PKCS1v15(), hashes.SHA256())
        jwt_token = f"{header_b64}.{claims_b64}.{b64(sig)}"

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                    "assertion": jwt_token,
                },
            )
            resp.raise_for_status()
            return resp.json().get("access_token")
    except Exception as e:
        print(f"Drive token error: {e}")
        return None


async def list_pdfs_in_folder(folder_id: str) -> List[Dict]:
    credentials = get_service_account_credentials()
    if not credentials:
        raise ValueError("Service account credentials not configured")

    token = await get_drive_access_token(credentials)
    if not token:
        raise ValueError("Failed to obtain Drive access token")

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            "https://www.googleapis.com/drive/v3/files",
            headers={"Authorization": f"Bearer {token}"},
            params={
                "q": f"'{folder_id}' in parents and mimeType='application/pdf' and trashed=false",
                "fields": "files(id,name,createdTime,modifiedTime)",
                "orderBy": "name desc",
            },
        )
        resp.raise_for_status()
        files = resp.json().get("files", [])

    result = []
    for f in files:
        m = re.search(r"(\d+)기", f["name"])
        generation = int(m.group(1)) if m else None
        result.append({
            "id": f["id"],
            "name": f["name"],
            "generation": generation,
            "preview_url": f"https://drive.google.com/file/d/{f['id']}/preview",
            "download_url": f"https://drive.google.com/uc?export=download&id={f['id']}",
        })

    return result


async def list_forms_in_folder(folder_id: str) -> List[Dict]:
    """List Google Forms in a Drive folder, sorted by name descending."""
    credentials = get_service_account_credentials()
    if not credentials:
        raise ValueError("Service account credentials not configured")

    token = await get_drive_access_token(credentials)
    if not token:
        raise ValueError("Failed to obtain Drive access token")

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            "https://www.googleapis.com/drive/v3/files",
            headers={"Authorization": f"Bearer {token}"},
            params={
                "q": f"'{folder_id}' in parents and mimeType='application/vnd.google-apps.form' and trashed=false",
                "fields": "files(id,name,createdTime)",
                "orderBy": "name desc",
            },
        )
        resp.raise_for_status()
        files = resp.json().get("files", [])

    result = []
    for f in files:
        m = re.search(r"(\d+)기", f["name"])
        generation = int(m.group(1)) if m else None
        result.append({
            "id": f["id"],
            "name": f["name"],
            "generation": generation,
            "form_url": f"https://docs.google.com/forms/d/{f['id']}/viewform",
        })

    return result
