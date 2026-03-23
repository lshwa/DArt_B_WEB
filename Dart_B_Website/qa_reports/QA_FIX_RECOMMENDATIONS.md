# QA 수정 권고안 (QA_FIX_RECOMMENDATIONS.md)

| 수정 필요 여부 | 파일 경로 | 수정 권고 사항 |
| --- | --- | --- |
| **필수** | `backend/main.py` | 최초 실행 시 임의의 안전한 비밀번호를 생성하여 출력하고, 사용자가 즉시 변경하도록 유도해야 합니다. 또는 환경 변수를 통해 초기 비밀번호를 설정하도록 변경해야 합니다. |
| **권장** | `backend/main.py`, `backend/schemas.py` | `schemas.py`의 각 모델 필드에 `Field`를 사용하여 길이, 정규식 등 명시적인 유효성 검사 규칙을 추가해야 합니다. |
| **권장** | `backend/main.py` | `HTTPException` 외에 발생할 수 있는 특정 예외(예: `sqlalchemy.exc.IntegrityError`)를 개별적으로 처리하여, 오류의 원인을 명확히 하고 사용자에게 더 구체적인 피드백을 제공해야 합니다. |
| **필수** | `backend/main.py` | `pydantic` 버전을 명확히 하고, `model_dump()` 또는 `dict()` 중 하나로 통일하여 일관성을 유지해야 합니다. |
| **권장** | `backend/` | 데이터베이스 로직, 파일 처리 등 핵심 비즈니스 로직을 별도의 서비스 레이어로 분리하여 API 엔드포인트의 복잡도를 낮추고 재사용성을 높여야 합니다. |
| **권장** | `backend/` | `pyproject.toml` 파일을 생성하고 `project.requires-python` 필드를 설정하여, 프로젝트가 요구하는 Python 버전을 명시하고 강제해야 합니다. |
| **필수** | `frontend/src/api.ts` | 환경 변수(Vite의 경우 `import.meta.env.VITE_API_URL`)를 사용하여 API URL을 동적으로 설정해야 합니다. `.env.development`와 `.env.production` 파일을 통해 환경별로 다른 URL을 관리할 수 있습니다. |
| **권장** | `frontend/src/api.ts` | 모든 API 요청이 일관된 `apiCall` 헬퍼 함수를 사용하도록 리팩토링해야 합니다. 파일 업로드와 같은 `FormData`를 사용하는 요청도 이 헬퍼 함수 내에서 처리할 수 있습니다. |
| **권장** | `frontend/src/api.ts` | 보안 강화를 위해, 인증 토큰을 `HttpOnly` 쿠키에 저장하는 방식으로 백엔드와 협의하여 변경하는 것을 고려해야 합니다. |
| **권장** | `frontend/src/api.ts` | 401 오류 발생 시, 모달 또는 알림을 통해 사용자에게 세션 만료를 알리고, 사용자가 직접 재로그인 또는 페이지 이동을 선택할 수 있도록 개선해야 합니다. |
| **권장** | `frontend/src/api.ts` | `axios`와 같은 라이브러리를 도입하고, 기본 URL, 헤더, 인터셉터(요청/응답)가 설정된 중앙 API 클라이언트 인스턴스를 생성하여 사용하면 코드 중복을 줄이고 유지보수성을 높일 수 있습니다. |
| **필수** | `DArt-B Website.make` | 파일의 확장자를 `.zip`으로 변경하고, 파일의 용도를 명확히 문서화해야 합니다. 불필요한 파일이라면 삭제해야 합니다. |
| **필수** | `/` (루트 디렉토리) | 중복된 `App.tsx` 파일과 `components` 디렉토리를 삭제하여 프로젝트 구조를 정리하고 혼란을 방지해야 합니다. |