import PyPDF2
import re
from typing import List, Dict, Optional
from io import BytesIO


def parse_pdf(pdf_file: bytes) -> List[Dict[str, Optional[str]]]:
    """
    PDF 파일을 파싱하여 멤버 정보 추출
    PDF 형식에 따라 수정이 필요할 수 있습니다.
    """
    members = []
    
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_file))
        
        for page_num, page in enumerate(pdf_reader.pages):
            text = page.extract_text()
            
            # 텍스트를 줄 단위로 분리
            lines = text.split('\n')
            
            # 멤버 정보 패턴 (예시 - 실제 PDF 형식에 맞게 수정 필요)
            # 예: "이름 | 기수 | 전공 | 학번 | 이메일"
            for line in lines:
                line = line.strip()
                if not line or len(line) < 5:
                    continue
                
                # 탭 또는 파이프로 구분된 데이터 파싱
                parts = re.split(r'\s*\|\s*|\s+\t+\s+|\s{2,}', line)
                
                if len(parts) >= 2:
                    member = {
                        "name": parts[0].strip() if len(parts) > 0 else None,
                        "generation": _extract_generation(parts),
                        "major": parts[2].strip() if len(parts) > 2 else None,
                        "student_id": parts[3].strip() if len(parts) > 3 else None,
                        "email": _extract_email(line),
                        "position": _extract_position(line),
                    }
                    
                    # 유효한 이름이 있는 경우만 추가
                    if member["name"] and len(member["name"]) > 0:
                        members.append(member)
        
        return members
    
    except Exception as e:
        raise ValueError(f"PDF 파싱 오류: {str(e)}")


def _extract_generation(parts: List[str]) -> Optional[int]:
    """기수 추출"""
    for part in parts:
        # "5기", "5", "generation 5" 등의 패턴 찾기
        match = re.search(r'(\d+)\s*기|generation\s*(\d+)', part, re.IGNORECASE)
        if match:
            return int(match.group(1) or match.group(2))
    return None


def _extract_email(text: str) -> Optional[str]:
    """이메일 주소 추출"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None


def _extract_position(text: str) -> Optional[str]:
    """직책 추출"""
    positions = ["총괄팀장", "운영팀장", "교육팀장", "대외협력팀장", "기획총무팀장", "홍보팀장"]
    for pos in positions:
        if pos in text:
            return pos
    return None


def parse_csv_from_pdf(pdf_file: bytes) -> List[Dict[str, Optional[str]]]:
    """
    PDF에 포함된 CSV 형식의 데이터를 파싱
    (구글 폼에서 PDF로 내보낸 경우 등)
    """
    members = []
    
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_file))
        full_text = ""
        
        for page in pdf_reader.pages:
            full_text += page.extract_text() + "\n"
        
        # CSV 형식 파싱
        lines = full_text.split('\n')
        header_found = False
        headers = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 헤더 찾기
            if not header_found and ('이름' in line or 'name' in line.lower()):
                headers = [h.strip() for h in re.split(r',|\t', line)]
                header_found = True
                continue
            
            if header_found:
                values = [v.strip() for v in re.split(r',|\t', line)]
                if len(values) >= len(headers):
                    member = {}
                    for i, header in enumerate(headers):
                        if i < len(values):
                            member[header.lower().replace(' ', '_')] = values[i]
                    
                    if 'name' in member or '이름' in member:
                        members.append(member)
        
        return members
    
    except Exception as e:
        raise ValueError(f"CSV 파싱 오류: {str(e)}")

