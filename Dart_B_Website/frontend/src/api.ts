// API Base URL - uses environment variable with fallback to localhost
const getApiBaseUrl = (): string => {
  // Vite exposes env vars via import.meta.env
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  // Fallback for development
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Backend base URL (without /api/v1) for static files
const getBackendBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return 'http://localhost:8000';
  return envUrl.replace(/\/api\/v1$/, '');
};

// API 응답 타입
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// 인증 관련
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AdminInfo {
  id: number;
  username: string;
  email?: string;
  is_active: boolean;
}

// 멤버 관련
export interface Member {
  id: number;
  name: string;
  generation: number;
  position?: string;
  major?: string;
  student_id?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  profile_image_url?: string;
  is_executive: boolean;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberCreate {
  name: string;
  generation: number;
  position?: string;
  major?: string;
  student_id?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  profile_image_url?: string;
  is_executive?: boolean;
  is_active?: boolean;
  notes?: string;
}

export interface MemberUpdate {
  name?: string;
  generation?: number;
  position?: string;
  major?: string;
  student_id?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  profile_image_url?: string;
  is_executive?: boolean;
  is_active?: boolean;
  notes?: string;
}

// 토큰 관리
export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
  // 커스텀 이벤트 발생 (현재 탭에서 토큰 변경 감지)
  window.dispatchEvent(new Event('tokenChanged'));
};

export const removeToken = (): void => {
  localStorage.removeItem('access_token');
  // 커스텀 이벤트 발생 (현재 탭에서 토큰 변경 감지)
  window.dispatchEvent(new Event('tokenChanged'));
};

// 401 에러 발생 시 로그아웃 처리 (사용자에게 알림 후 처리)
const handleUnauthorized = () => {
  // 사용자에게 알림 표시
  const message = '인증이 만료되었습니다. 다시 로그인해주세요.';
  alert(message);
  
  // 토큰 제거 및 로그아웃 처리
  removeToken();
  
  // 관리자 페이지인 경우에만 홈으로 리다이렉트
  if (window.location.pathname.includes('admin') || window.location.hash.includes('admin')) {
    window.location.href = '/';
  }
};

// API 호출 헬퍼
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 401 에러 처리
    if (response.status === 401) {
      handleUnauthorized();
      return { error: '인증이 만료되었습니다. 다시 로그인해주세요.' };
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return { error: error.detail || 'Request failed' };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    // 네트워크 오류인 경우 더 자세한 메시지 제공
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        error: `백엔드 서버에 연결할 수 없습니다. 백엔드가 ${getBackendBaseUrl()} 에서 실행 중인지 확인해주세요.`
      };
    }
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// 인증 API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiCall<LoginResponse>('/auth/login/json', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getMe: async (): Promise<ApiResponse<AdminInfo>> => {
    return apiCall<AdminInfo>('/auth/me');
  },
};

// 멤버 API
export const memberApi = {
  getAll: async (params?: {
    generation?: number;
    is_executive?: boolean;
    is_active?: boolean;
  }): Promise<ApiResponse<Member[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.generation) queryParams.append('generation', params.generation.toString());
    if (params?.is_executive !== undefined) queryParams.append('is_executive', params.is_executive.toString());
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const query = queryParams.toString();
    return apiCall<Member[]>(`/members${query ? `?${query}` : ''}`);
  },

  getById: async (id: number): Promise<ApiResponse<Member>> => {
    return apiCall<Member>(`/members/${id}`);
  },

  create: async (member: MemberCreate): Promise<ApiResponse<Member>> => {
    return apiCall<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  },

  update: async (id: number, member: MemberUpdate): Promise<ApiResponse<Member>> => {
    return apiCall<Member>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    });
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/members/${id}`, {
      method: 'DELETE',
    });
  },

  uploadPDF: async (file: File): Promise<ApiResponse<{ message: string; members_created: number; members_updated: number }>> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/members/upload-pdf`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      // 401 에러 처리
      if (response.status === 401) {
        handleUnauthorized();
        return { error: '인증이 만료되었습니다. 다시 로그인해주세요.' };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        return { error: error.detail || 'Upload failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },

};

// Google Sheets Sync API
export interface SyncStatus {
  configured: boolean;
  sheet_id_set: boolean;
  service_account_set: boolean;
  api_key_set: boolean;
}

export interface SyncResult {
  success: boolean;
  message: string;
  count: number;
  created: number;
  updated: number;
}

export const syncApi = {
  // Get sync configuration status
  getStatus: async (): Promise<ApiResponse<SyncStatus>> => {
    return apiCall<SyncStatus>('/sync/status');
  },

  // One-click sync from Google Sheets (uses server-side credentials)
  syncMembers: async (): Promise<ApiResponse<SyncResult>> => {
    const token = getToken();

    try {
      const response = await fetch(`${API_BASE_URL}/sync/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // 401 에러 처리
      if (response.status === 401) {
        handleUnauthorized();
        return { error: '인증이 만료되었습니다. 다시 로그인해주세요.' };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        return { error: error.detail || 'Sync failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },
};

// 이미지 업로드 API
export const uploadApi = {
  uploadImage: async (
    file: File,
    category: 'members' | 'logos' | 'images' = 'images',
    customFilename?: string
  ): Promise<ApiResponse<{ message: string; url: string; filename: string }>> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (customFilename) {
      formData.append('custom_filename', customFilename);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // FormData를 사용할 때는 Content-Type을 설정하지 않아야 브라우저가 자동으로 boundary를 설정합니다
        },
        body: formData,
      });

      // 401 에러 처리
      if (response.status === 401) {
        handleUnauthorized();
        return { error: '인증이 만료되었습니다. 다시 로그인해주세요.' };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        return { error: error.detail || 'Upload failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },

  listImages: async (
    category: 'members' | 'logos' | 'images' = 'images'
  ): Promise<ApiResponse<{ category: string; files: string[]; count: number }>> => {
    return apiCall<{ category: string; files: string[]; count: number }>(
      `/upload/images?category=${category}`
    );
  },

  deleteImage: async (filePath: string): Promise<ApiResponse<{ message: string }>> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file_path', filePath);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      // 401 에러 처리
      if (response.status === 401) {
        handleUnauthorized();
        return { error: '인증이 만료되었습니다. 다시 로그인해주세요.' };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        return { error: error.detail || 'Delete failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },
};

// 이미지 URL 헬퍼
export const getImageUrl = (path: string): string => {
  if (!path || path.trim() === '') {
    return '';
  }
  
  // 이미 전체 URL인 경우
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      // URL을 파싱하고 경로 부분만 인코딩
      const url = new URL(path);
      // 경로를 세그먼트로 나누고 각 세그먼트를 인코딩 (슬래시는 유지)
      const pathSegments = url.pathname.split('/').filter(s => s !== '');
      const encodedPath = '/' + pathSegments.map(segment => encodeURIComponent(segment)).join('/');
      // 쿼리와 해시는 그대로 유지
      return `${url.protocol}//${url.host}${encodedPath}${url.search}${url.hash}`;
    } catch (e) {
      // URL 파싱 실패 시 원본 반환
      return path;
    }
  }
  
  const backendUrl = getBackendBaseUrl();

  // /uploads/로 시작하는 경우 백엔드 URL 추가 및 인코딩
  if (path.startsWith('/uploads/')) {
    // 경로를 세그먼트로 나누고 각 세그먼트를 인코딩
    const pathSegments = path.split('/').filter(s => s !== '');
    const encodedPath = '/' + pathSegments.map(segment => encodeURIComponent(segment)).join('/');
    return `${backendUrl}${encodedPath}`;
  }

  // 상대 경로인 경우도 백엔드 URL 추가 및 인코딩
  if (path.startsWith('uploads/')) {
    const pathSegments = path.split('/').filter(s => s !== '');
    const encodedPath = '/' + pathSegments.map(segment => encodeURIComponent(segment)).join('/');
    return `${backendUrl}${encodedPath}`;
  }

  // 그 외의 경우 백엔드 URL 추가 시도 및 인코딩
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const pathSegments = cleanPath.split('/').filter(s => s !== '');
  const encodedPath = '/' + pathSegments.map(segment => encodeURIComponent(segment)).join('/');
  return `${backendUrl}${encodedPath}`;
};

// 설정 API
export const settingsApi = {
  getSetting: async (key: string): Promise<ApiResponse<{ key: string; value: string }>> => {
    return apiCall<{ key: string; value: string }>(`/settings/${key}`);
  },

  updateSetting: async (key: string, value: string): Promise<ApiResponse<{ key: string; value: string; message: string }>> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('value', value);

    try {
      const response = await fetch(`${API_BASE_URL}/settings/${key}`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      // 401 에러 처리
      if (response.status === 401) {
        handleUnauthorized();
        return { error: '인증이 만료되었습니다. 다시 로그인해주세요.' };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        return { error: error.detail || 'Update failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },

  uploadLogo: async (file: File): Promise<ApiResponse<{ message: string; url: string }>> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/logo`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      // 401 에러 처리
      if (response.status === 401) {
        handleUnauthorized();
        return { error: '인증이 만료되었습니다. 다시 로그인해주세요.' };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        return { error: error.detail || 'Upload failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },
};

// 사이트 이미지 타입
export interface SiteImage {
  url: string;
  description: string;
}

export type SiteImageMap = Record<string, SiteImage>;

// 사이트 이미지 API
export const siteImagesApi = {
  // 모든 사이트 이미지 조회
  getAll: async (): Promise<ApiResponse<SiteImageMap>> => {
    return apiCall<SiteImageMap>('/site-images');
  },

  // 개별 이미지 업데이트 (파일 업로드)
  updateWithFile: async (key: string, file: File): Promise<ApiResponse<{ key: string; url: string; message: string }>> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/site-images/${key}`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return { error: '인증이 만료되었습니다.' };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        return { error: error.detail || 'Update failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },

  // 개별 이미지 업데이트 (URL 직접 입력)
  updateWithUrl: async (key: string, url: string): Promise<ApiResponse<{ key: string; url: string; message: string }>> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('url', url);

    try {
      const response = await fetch(`${API_BASE_URL}/site-images/${key}`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return { error: '인증이 만료되었습니다.' };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        return { error: error.detail || 'Update failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  },
};

