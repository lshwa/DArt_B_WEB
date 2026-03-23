#!/usr/bin/env python3
"""
백엔드 서버 상태 확인 스크립트
"""
import requests
import sys

def check_server():
    try:
        response = requests.get("http://localhost:8000/api/v1/health", timeout=5)
        if response.status_code == 200:
            print("✅ 백엔드 서버가 정상적으로 실행 중입니다!")
            print(f"   응답: {response.json()}")
            return True
        else:
            print(f"❌ 백엔드 서버가 응답하지 않습니다. 상태 코드: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 백엔드 서버에 연결할 수 없습니다.")
        print("   백엔드를 실행하려면:")
        print("   cd backend")
        print("   uvicorn main:app --reload --port 8000")
        return False
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

if __name__ == "__main__":
    success = check_server()
    sys.exit(0 if success else 1)

