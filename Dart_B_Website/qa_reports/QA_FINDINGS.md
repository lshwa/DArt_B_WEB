# QA 상세 분석 보고서 (QA_FINDINGS.md)

| 심각도 | 파일 경로 | 문제 내용 |
| --- | --- | --- |
| **HIGH** | `backend/main.py` | 기본 관리자 계정의 비밀번호가 'admin123'으로 하드코딩되어 있어 심각한 보안 위험이 존재합니다. |
| **MEDIUM** | `backend/main.py` | API 엔드포인트에서 입력값에 대한 상세한 유효성 검사(예: 문자열 길이, 형식)가 부족합니다. |
| **LOW** | `backend/main.py` | 일부 예외 처리 블록이 `except Exception`으로 광범위하게 작성되어, 특정 오류를 파악하고 디버깅하기 어렵게 만듭니다. |
| **LOW** | `backend/main.py` | Pydantic v1과 v2의 메서드(`dict()`와 `model_dump()`)가 혼용되고 있어, 라이브러리 버전에 따라 예기치 않은 동작을 유발할 수 있습니다. |
| **MEDIUM** | `backend/main.py` | 비즈니스 로직이 API 엔드포인트와 강하게 결합되어 있어, 코드의 유지보수성 및 테스트 용이성을 저해합니다. |
| **LOW** | `README.md` | `Python 3.8` 이상 사용이 명시되어 있으나, `pyproject.toml` 이나 다른 의존성 관리 도구를 통해 강제되지 않고 있습니다. |
| **HIGH** | `frontend/src/api.ts` | API의 기본 URL이 `http://localhost:8000/api/v1`으로 하드코딩되어 있어, 개발 환경과 프로덕션 환경의 전환이 어렵습니다. |
| **MEDIUM** | `frontend/src/api.ts` | `apiCall` 헬퍼 함수와 `fetch`를 직접 사용하는 방식이 혼용되어, 코드의 일관성이 부족하고 인증 및 오류 처리 로직이 중복됩니다. |
| **MEDIUM** | `frontend/src/api.ts` | 인증 토큰을 `localStorage`에 저장하여, 사이트 간 스크립팅(XSS) 공격에 취약할 수 있습니다. |
| **LOW** | `frontend/src/api.ts` | 401 오류 발생 시, 사용자 확인 없이 페이지를 자동으로 새로고침하여 사용자의 작업 흐름을 방해할 수 있습니다. |
| **LOW** | `frontend/src/api.ts` | API 요청을 위해 `fetch`를 직접 사용하고 있어, `axios`와 같은 라이브러리에서 제공하는 중앙화된 인스턴스 설정, 인터셉터 등의 기능을 활용하지 못합니다. |
| **HIGH** | `DArt-B Website.make` | 파일 확장자가 `.make`이지만 실제로는 Zip 압축 파일입니다. 이는 혼란을 유발하고 잠재적인 보안 위험을 내포합니다. |
| **MEDIUM** | `/` (루트 디렉토리) | `frontend` 디렉토리 내의 파일들과 중복되는 `App.tsx` 파일과 `components` 디렉토리가 존재하여, 코드 관리의 혼란을 야기하고 유지보수를 어렵게 만듭니다. |