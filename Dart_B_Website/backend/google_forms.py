import httpx
from typing import List, Dict, Optional
import json
import re
import os
from pathlib import Path
from file_upload import save_uploaded_file, MEMBER_IMAGES_DIR


# ==================== Service Account Authentication ====================

def get_service_account_credentials() -> Optional[Dict]:
    """
    Load Google Service Account credentials from environment.
    Supports both file path and inline JSON.
    """
    creds_path = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")

    if not creds_path:
        return None

    # Check if it's a file path or inline JSON
    if creds_path.startswith("{"):
        # Inline JSON
        try:
            return json.loads(creds_path)
        except json.JSONDecodeError:
            print("Error: Invalid inline JSON in GOOGLE_SERVICE_ACCOUNT_JSON")
            return None
    else:
        # File path
        try:
            with open(creds_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: Service account file not found: {creds_path}")
            return None
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON in service account file: {creds_path}")
            return None


async def get_service_account_token(credentials: Dict) -> Optional[str]:
    """
    Generate OAuth2 access token from Service Account credentials using JWT.
    """
    import time
    import base64
    import hashlib
    from cryptography.hazmat.primitives import serialization, hashes
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.backends import default_backend

    try:
        # JWT header
        header = {"alg": "RS256", "typ": "JWT"}

        # JWT claims
        now = int(time.time())
        claims = {
            "iss": credentials["client_email"],
            "scope": "https://www.googleapis.com/auth/spreadsheets.readonly",
            "aud": "https://oauth2.googleapis.com/token",
            "iat": now,
            "exp": now + 3600,  # 1 hour
        }

        # Encode header and claims
        def base64url_encode(data: bytes) -> str:
            return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

        header_b64 = base64url_encode(json.dumps(header).encode())
        claims_b64 = base64url_encode(json.dumps(claims).encode())

        # Create signature
        message = f"{header_b64}.{claims_b64}".encode()

        # Load private key
        private_key = serialization.load_pem_private_key(
            credentials["private_key"].encode(),
            password=None,
            backend=default_backend()
        )

        # Sign
        signature = private_key.sign(
            message,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        signature_b64 = base64url_encode(signature)

        jwt_token = f"{header_b64}.{claims_b64}.{signature_b64}"

        # Exchange JWT for access token
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                    "assertion": jwt_token,
                },
            )
            response.raise_for_status()
            token_data = response.json()
            return token_data.get("access_token")

    except Exception as e:
        print(f"Error generating service account token: {e}")
        return None


async def sync_with_service_account(
    sheet_id: str,
    range_name: str = "A1:Z1000"
) -> List[Dict[str, Optional[str]]]:
    """
    Sync from Google Sheets using Service Account authentication.
    This is the preferred method for server-side automation.
    """
    credentials = get_service_account_credentials()

    if not credentials:
        raise ValueError(
            "Service Account credentials not configured. "
            "Set GOOGLE_SERVICE_ACCOUNT_JSON environment variable."
        )

    access_token = await get_service_account_token(credentials)

    if not access_token:
        raise ValueError("Failed to obtain access token from Service Account.")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/{range_name}"
            headers = {"Authorization": f"Bearer {access_token}"}

            print(f"Fetching Google Sheet: {sheet_id}")
            response = await client.get(url, headers=headers)

            if response.status_code == 404:
                raise ValueError(f"Sheet not found: {sheet_id}")
            elif response.status_code == 403:
                raise ValueError(
                    "Access denied. Ensure the Service Account has access to the sheet. "
                    "Share the sheet with the service account email."
                )

            response.raise_for_status()
            data = response.json()
            values = data.get("values", [])

            if not values:
                return []

            headers_row = values[0]
            members = []

            for idx, row in enumerate(values[1:], start=2):
                if not row or all(not cell or str(cell).strip() == "" for cell in row):
                    continue

                form_data = {}
                for i, header in enumerate(headers_row):
                    if i < len(row):
                        form_data[header] = str(row[i]).strip()

                member = parse_google_form_member(form_data)

                if not member.get("name") or not member.get("generation"):
                    continue

                # Download Google Drive images
                if member.get("profile_image_url") and "drive.google.com" in member["profile_image_url"]:
                    downloaded_path = await download_google_drive_image(
                        member["profile_image_url"],
                        member["name"],
                        member.get("generation", 0)
                    )
                    if downloaded_path:
                        member["profile_image_url"] = downloaded_path

                members.append(member)

            print(f"Parsed {len(members)} members from sheet")
            return members

    except httpx.HTTPStatusError as e:
        raise ValueError(f"Google Sheets API error: {e.response.status_code}")
    except Exception as e:
        raise ValueError(f"Sync error: {str(e)}")


async def fetch_google_form_responses(
    form_id: str,
    api_key: Optional[str] = None
) -> List[Dict[str, str]]:
    """
    구글 폼 응답 가져오기
    
    참고: 구글 폼 API는 제한적이므로, 실제로는:
    1. 구글 시트로 응답을 받고 시트 API 사용
    2. 또는 웹훅을 통해 데이터 수신
    3. 또는 수동으로 CSV 내보내기 후 업로드
    
    이 함수는 시트 API를 사용하는 예시입니다.
    """
    if not api_key:
        raise ValueError("Google API 키가 필요합니다")
    
    # 구글 시트 API를 통한 데이터 가져오기
    # 실제 구현 시 구글 API 클라이언트 라이브러리 사용 권장
    sheet_id = form_id  # 실제로는 시트 ID
    
    async with httpx.AsyncClient() as client:
        try:
            # 구글 시트 API 엔드포인트 (예시)
            url = f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/A1:Z1000"
            params = {"key": api_key}
            
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            values = data.get("values", [])
            
            if not values:
                return []
            
            # 첫 번째 행을 헤더로 사용
            headers = values[0]
            members = []
            
            for row in values[1:]:
                member = {}
                for i, header in enumerate(headers):
                    if i < len(row):
                        member[header.lower().replace(' ', '_')] = row[i]
                
                if member:
                    members.append(member)
            
            return members
        
        except Exception as e:
            raise ValueError(f"구글 폼 데이터 가져오기 오류: {str(e)}")


def parse_google_form_member(form_data: Dict[str, str]) -> Dict[str, Optional[str]]:
    """
    구글 폼 응답 데이터를 멤버 정보로 변환
    실제 폼 필드명에 맞게 수정됨:
    - Timestamp (무시)
    - 기수를 선택해주세요
    - 이름을 입력해주세요
    - 전공을 학부형식으로 작성해주세요
    - 운영진으로 활동한 경우 "n기 ~팀장" 형식으로 입력해주세요
    - (선택) 프로필에 올라갈 사진을 업로드해주세요
    - (선택) 링크드인 프로필 주소를 입력해주세요
    - (선택) 깃허브 주소를 입력해주세요
    - (선택) 인스타그램 프로필 ID를 입력해주세요
    """
    import re
    
    member = {
        "name": None,
        "generation": None,
        "major": None,
        "position": None,
        "is_executive": False,
        "profile_image_url": None,
        "linkedin": None,
        "github": None,
        "instagram": None,
    }
    
    for form_key, form_value in form_data.items():
        if not form_value or not str(form_value).strip():
            continue
            
        normalized_key = form_key.lower().strip()
        normalized_value = str(form_value).strip()
        
        # Timestamp 무시
        if "timestamp" in normalized_key:
            continue
        
        # 기수 파싱 (정확한 필드명 매칭)
        if "기수를 선택해주세요" in form_key or "기수를 선택" in form_key:
            match = re.search(r'\d+', normalized_value)
            if match:
                member["generation"] = int(match.group(0))
            # "Other:" 같은 경우 처리
            elif "other" in normalized_value.lower():
                # Other 값은 무시
                pass
        
        # 이름 파싱
        elif "이름을 입력" in form_key or "이름" in normalized_key:
            member["name"] = normalized_value
        
        # 전공 파싱
        elif "전공을 학부" in form_key or "전공" in normalized_key:
            member["major"] = normalized_value
        
        # 운영진 직책 파싱 (정확한 필드명 매칭)
        elif "운영진으로 활동한 경우" in form_key or "운영진" in form_key:
            if normalized_value and normalized_value.strip():
                member["position"] = normalized_value
                # "n기 ~팀장" 형식에서 기수와 직책 추출
                # 기수 추출 (직책 필드에서도 기수 추출 가능)
                gen_match = re.search(r'(\d+)기', normalized_value)
                if gen_match and not member["generation"]:
                    member["generation"] = int(gen_match.group(1))
                # 팀장 여부 확인
                if "팀장" in normalized_value:
                    member["is_executive"] = True
        
        # 프로필 사진 (Google Drive 링크)
        elif "프로필에 올라갈 사진" in form_key or ("프로필" in normalized_key and ("사진" in normalized_key or "photo" in normalized_key or "image" in normalized_key)):
            # Google Drive 링크인 경우
            if normalized_value.startswith("http") and "drive.google.com" in normalized_value:
                member["profile_image_url"] = normalized_value
            elif normalized_value.startswith("http"):
                # 다른 이미지 URL도 허용
                member["profile_image_url"] = normalized_value
        
        # LinkedIn 파싱
        elif "링크드인" in form_key or "linkedin" in normalized_key:
            # URL 형식 정리
            if normalized_value:
                if normalized_value.startswith("http"):
                    member["linkedin"] = normalized_value
                elif normalized_value.startswith("www."):
                    member["linkedin"] = f"https://{normalized_value}"
                elif "/" in normalized_value or "@" in normalized_value:
                    member["linkedin"] = f"https://linkedin.com/in/{normalized_value.lstrip('/')}"
                else:
                    member["linkedin"] = f"https://linkedin.com/in/{normalized_value}"
        
        # GitHub 파싱
        elif "깃허브" in form_key or "github" in normalized_key:
            # URL 형식 정리
            if normalized_value:
                if normalized_value.startswith("http"):
                    member["github"] = normalized_value
                elif normalized_value.startswith("github.com"):
                    member["github"] = f"https://{normalized_value}"
                elif normalized_value.startswith("Github.com"):
                    member["github"] = f"https://{normalized_value.lower()}"
                elif "/" in normalized_value:
                    member["github"] = f"https://github.com/{normalized_value.lstrip('/')}"
                else:
                    member["github"] = f"https://github.com/{normalized_value}"
        
        # Instagram 파싱
        elif "인스타그램" in form_key or "instagram" in normalized_key:
            # ID만 입력된 경우 URL 형식으로 변환
            if normalized_value:
                if normalized_value.startswith("http"):
                    member["instagram"] = normalized_value
                else:
                    # @ 기호 제거
                    instagram_id = normalized_value.lstrip("@").strip()
                    member["instagram"] = f"https://instagram.com/{instagram_id}"
    
    # None 값 제거
    return {k: v for k, v in member.items() if v is not None and v != ""}


async def download_google_drive_image(
    drive_url: str,
    member_name: str,
    generation: int,
    api_key: Optional[str] = None
) -> Optional[str]:
    """
    Google Drive 링크에서 이미지 다운로드 및 저장
    """
    try:
        # Google Drive 파일 ID 추출
        # https://drive.google.com/file/d/FILE_ID/view 또는
        # https://drive.google.com/open?id=FILE_ID 형식
        file_id_match = re.search(r'/file/d/([a-zA-Z0-9_-]+)', drive_url)
        if not file_id_match:
            file_id_match = re.search(r'[?&]id=([a-zA-Z0-9_-]+)', drive_url)
        
        if not file_id_match:
            return None
        
        file_id = file_id_match.group(1)
        
        # Google Drive 직접 다운로드 URL 생성
        # 공개 파일인 경우: https://drive.google.com/uc?export=download&id=FILE_ID
        download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(download_url)
            response.raise_for_status()
            
            # 파일 확장자 확인 (Content-Type 또는 파일명에서)
            content_type = response.headers.get("content-type", "")
            if "image" not in content_type:
                # 파일명에서 확장자 추출 시도
                content_disposition = response.headers.get("content-disposition", "")
                ext_match = re.search(r'\.(jpg|jpeg|png|gif|webp)', content_disposition, re.IGNORECASE)
                if not ext_match:
                    return None
            
            # 파일명 생성
            ext = ".jpg"  # 기본값
            if "jpeg" in content_type or "jpg" in content_type:
                ext = ".jpg"
            elif "png" in content_type:
                ext = ".png"
            elif "gif" in content_type:
                ext = ".gif"
            elif "webp" in content_type:
                ext = ".webp"
            
            filename = f"{member_name}_{generation}기{ext}"
            file_path = MEMBER_IMAGES_DIR / filename
            
            # 파일 저장
            with open(file_path, "wb") as f:
                f.write(response.content)
            
            # 상대 경로 반환
            return f"/uploads/members/{filename}"
    
    except Exception as e:
        print(f"Google Drive 이미지 다운로드 오류: {str(e)}")
        return None


async def sync_from_google_sheet(
    sheet_id: str,
    api_key: str,
    range_name: str = "A1:Z1000"
) -> List[Dict[str, Optional[str]]]:
    """
    구글 시트에서 직접 동기화
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # 시트 ID에서 URL 인코딩 제거 (이미 인코딩된 경우 대비)
            clean_sheet_id = sheet_id.strip()
            
            # Google Sheets API v4 엔드포인트
            url = f"https://sheets.googleapis.com/v4/spreadsheets/{clean_sheet_id}/values/{range_name}"
            params = {"key": api_key}
            
            print(f"Google Sheets API 호출: {url}")
            
            response = await client.get(url, params=params)
            
            # 에러 응답 처리
            if response.status_code == 404:
                raise ValueError(
                    f"시트를 찾을 수 없습니다. 시트 ID가 올바른지 확인하세요: {clean_sheet_id}\n"
                    f"시트가 공유되어 있는지 확인하세요."
                )
            elif response.status_code == 403:
                raise ValueError(
                    f"시트 접근 권한이 없습니다. 다음을 확인하세요:\n"
                    f"1. API 키가 올바른지 확인\n"
                    f"2. Google Sheets API가 활성화되어 있는지 확인\n"
                    f"3. 시트가 공유되어 있는지 확인"
                )
            elif response.status_code == 400:
                error_data = response.json() if response.content else {}
                error_msg = error_data.get("error", {}).get("message", "잘못된 요청입니다")
                raise ValueError(f"잘못된 요청: {error_msg}")
            
            response.raise_for_status()
            
            data = response.json()
            values = data.get("values", [])
            
            if not values:
                print("시트에 데이터가 없습니다.")
                return []
            
            headers = values[0]
            print(f"시트 헤더: {headers}")
            members = []
            
            for idx, row in enumerate(values[1:], start=2):
                try:
                    # 빈 행 건너뛰기
                    if not row or all(not cell or str(cell).strip() == "" for cell in row):
                        continue
                    
                    form_data = {}
                    for i, header in enumerate(headers):
                        if i < len(row):
                            cell_value = row[i] if row[i] else ""
                            form_data[header] = str(cell_value).strip()
                    
                    # 디버깅: 파싱 전 데이터 출력
                    if form_data.get("이름을 입력해주세요.") or form_data.get("이름"):
                        print(f"행 {idx} 파싱 중: {form_data.get('이름을 입력해주세요.', form_data.get('이름', 'N/A'))}")
                    
                    member = parse_google_form_member(form_data)
                    
                    # 이름과 기수가 필수
                    if not member.get("name"):
                        print(f"행 {idx}: 이름이 없어 건너뜀")
                        continue
                    
                    if not member.get("generation"):
                        print(f"행 {idx}: {member.get('name')} - 기수가 없어 건너뜀")
                        continue
                    
                    # Google Drive 이미지 다운로드 시도
                    if member.get("profile_image_url") and "drive.google.com" in member["profile_image_url"]:
                        downloaded_path = await download_google_drive_image(
                            member["profile_image_url"],
                            member["name"],
                            member.get("generation", 0),
                            api_key
                        )
                        if downloaded_path:
                            member["profile_image_url"] = downloaded_path
                    
                    print(f"행 {idx}: {member.get('name')} ({member.get('generation')}기) 파싱 완료")
                    members.append(member)
                except Exception as e:
                    print(f"행 {idx} 처리 중 오류: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    continue
            
            print(f"총 {len(members)}명의 멤버를 파싱했습니다.")
            return members
    
    except httpx.HTTPStatusError as e:
        error_msg = f"HTTP {e.response.status_code}: "
        try:
            error_data = e.response.json()
            error_msg += error_data.get("error", {}).get("message", str(e))
        except:
            error_msg += str(e)
        raise ValueError(f"구글 시트 API 오류: {error_msg}")
    except httpx.RequestError as e:
        raise ValueError(f"네트워크 오류: {str(e)}")
    except Exception as e:
        raise ValueError(f"구글 시트 동기화 오류: {str(e)}")

