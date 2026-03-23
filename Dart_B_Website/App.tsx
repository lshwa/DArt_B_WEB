import React, { useState } from 'react';
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
import { LoginPage } from './components/pages/LoginPage';
import { PasswordResetPage } from './components/pages/PasswordResetPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} onLogin={setIsLoggedIn} />;
      case 'password-reset':
        return <PasswordResetPage onNavigate={setCurrentPage} />;
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

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} isLoggedIn={isLoggedIn} />
      {renderContent()}
      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}