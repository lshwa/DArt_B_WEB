import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MainBanner } from './components/MainBanner';
import { SwipeBanner } from './components/SwipeBanner';
import { CurriculumSection } from './components/CurriculumSection';
import { Footer } from './components/Footer';
import { AboutUs } from './components/pages/AboutUs';
import { Preface } from './components/pages/Preface';
import { Rules } from './components/pages/Rules';
import { Curriculum } from './components/pages/Curriculum';
import { Webzin } from './components/pages/Webzin';
import { DataThon } from './components/pages/DataThon';
import { Members } from './components/pages/Members';
import { Networking } from './components/pages/Networking';
import { Recruiting } from './components/pages/Recruiting';
import { Recommendations } from './components/pages/Recommendations';
import { LoginPage } from './components/pages/LoginPage';
import { PasswordResetPage } from './components/pages/PasswordResetPage';
import { AdminPage } from './components/pages/AdminPage';
import { LoginModal } from './components/common/LoginModal';
import { getToken } from './src/api';
import { SiteImageProvider } from './src/SiteImageContext';
import { SiteTextProvider } from './src/SiteTextContext';

export default function App() {
  // URL에서 페이지 읽기 또는 기본값 'home'
  const getInitialPage = () => {
    const hash = window.location.hash.slice(1); // # 제거
    if (hash) {
      return hash;
    }
    const stored = localStorage.getItem('currentPage');
    return stored || 'home';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 모달 상태
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalReason, setLoginModalReason] = useState<'admin-gate' | 'general'>('general');

  // admin 라우트 접근 시 토큰 확인
  const checkAdminAccess = useCallback((page: string) => {
    if (page === 'admin') {
      const token = getToken();
      if (!token) {
        // 토큰이 없으면 로그인 모달 표시
        setLoginModalReason('admin-gate');
        setIsLoginModalOpen(true);
        return false; // 접근 불가
      }
    }
    return true; // 접근 허용
  }, []);

  // 로그인 모달 닫기 핸들러
  const handleLoginModalClose = useCallback(() => {
    setIsLoginModalOpen(false);

    // admin-gate에서 닫기(X) 버튼을 눌렀을 때만 홈으로 리다이렉트
    if (loginModalReason === 'admin-gate') {
      // replace navigation으로 뒤로가기에 admin이 남지 않도록
      setCurrentPage('home');
      window.location.replace('#home');
      localStorage.setItem('currentPage', 'home');
    }
  }, [loginModalReason]);

  // 로그인 성공 핸들러
  const handleLoginSuccess = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsLoggedIn(true);
    // admin-gate에서 로그인 성공 시 admin 페이지 유지
    if (loginModalReason === 'admin-gate') {
      // 이미 currentPage가 admin이므로 유지
      // AdminPage가 렌더링되도록 함
    }
  }, [loginModalReason]);

  // 페이지 변경 시 URL과 localStorage 업데이트
  const handleNavigate = (page: string) => {
    // admin 페이지로 이동 시 토큰 확인
    if (!checkAdminAccess(page)) {
      // 토큰 없으면 currentPage를 admin으로 설정하되 모달 띄움
      setCurrentPage(page);
      window.location.hash = page;
      localStorage.setItem('currentPage', page);
      return;
    }

    setCurrentPage(page);
    window.location.hash = page;
    localStorage.setItem('currentPage', page);
  };

  // 초기 로드 시 admin 접근 확인
  useEffect(() => {
    checkAdminAccess(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <main>
            <MainBanner />
            <SwipeBanner onNavigate={setCurrentPage} />
            <CurriculumSection />
          </main>
        );
      case 'about-us':
        return <AboutUs />;
      case 'preface':
        return <Preface />;
      case 'rules':
        return <Rules />;
      case 'curriculum':
        return <Curriculum />;
      case 'webzin':
        return <Webzin />;
      case 'data-thon':
        return <DataThon />;
      case 'members':
        return <Members />;
      case 'networking':
        return <Networking />;
      case 'recruiting':
        return <Recruiting />;
      case 'recommendations':
        return <Recommendations />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} onLogin={setIsLoggedIn} />;
      case 'password-reset':
        return <PasswordResetPage onNavigate={setCurrentPage} />;
      case 'admin':
        // 토큰이 없으면 홈 화면을 보여줌 (로그인 모달이 오버레이로 뜸)
        if (!getToken()) {
          return (
            <main>
              <MainBanner />
              <SwipeBanner onNavigate={setCurrentPage} />
              <CurriculumSection />
            </main>
          );
        }
        return <AdminPage onNavigate={setCurrentPage} onLogin={setIsLoggedIn} />;
      default:
        return (
          <main>
            <MainBanner />
            <SwipeBanner onNavigate={setCurrentPage} />
            <CurriculumSection />
          </main>
        );
    }
  };

  // URL 해시 변경 감지
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
        localStorage.setItem('currentPage', hash);
        // admin 라우트 접근 시 토큰 확인
        checkAdminAccess(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [checkAdminAccess]);

  return (
    <SiteImageProvider>
    <SiteTextProvider>
      <div className="min-h-screen bg-white">
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          onLogin={setIsLoggedIn}
        />
        {renderContent()}
        <Footer onNavigate={handleNavigate} />

        {/* 로그인 모달 */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={handleLoginModalClose}
          onLoginSuccess={handleLoginSuccess}
          triggerReason={loginModalReason}
        />
      </div>
    </SiteTextProvider>
    </SiteImageProvider>
  );
}