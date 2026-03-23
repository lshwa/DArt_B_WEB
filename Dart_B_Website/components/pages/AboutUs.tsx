import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function AboutUs() {
  return (
    <div className="min-h-screen">
      <PageBanner title="ABOUT US" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Introduction */}
          <div className="text-center mb-16">
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              DArt-B는 다변화된 비즈니스 환경에서 데이터에 기반하여 INSIGHT를 도출하고 의사결정을 하고자 하는 사람들의 모임입니다.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="w-full h-80 bg-[#0B2447] rounded-[10px] flex items-center justify-center shadow-lg">
                <div className="text-white text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#0B2447] font-bold text-3xl">DB</span>
                  </div>
                  <h3 className="text-2xl font-bold">DArt-B</h3>
                  <p className="text-blue-200">Data Analysis road to Business</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#0B2447] mb-6">DArt-B 학회 소개</h3>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  DArt-B(Data Analysis road to Business)는 중앙대학교 경영학부에서 활동하는 데이터 분석 학회입니다.
                </p>
                <p>
                  우리는 데이터를 통해 비즈니스 인사이트를 도출하고, 실무에 적용할 수 있는 역량을 기르는 것을 목표로 합니다. 
                  이론과 실습을 균형있게 배우며, 다양한 프로젝트와 대회 참여를 통해 실전 경험을 쌓아갑니다.
                </p>
                <p>
                  매 학기 정규 세션, 스터디, 프로젝트, 그리고 네트워킹 이벤트를 통해 학회원들이 함께 성장할 수 있는 
                  환경을 만들어가고 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="bg-gray-50 rounded-[10px] p-8">
            <h3 className="text-2xl font-bold text-[#0B2447] text-center mb-8">연혁</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#0B2447] rounded-full flex items-center justify-center text-white font-bold">
                  2019
                </div>
                <div>
                  <h4 className="font-bold text-lg">1기 창립</h4>
                  <p className="text-gray-600">중앙대학교 경영학부 데이터 분석 학회 DArt-B 창립</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#0B2447] rounded-full flex items-center justify-center text-white font-bold">
                  2020
                </div>
                <div>
                  <h4 className="font-bold text-lg">2기-3기 활동</h4>
                  <p className="text-gray-600">온라인 세션 도입 및 정규 커리큘럼 체계화</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#0B2447] rounded-full flex items-center justify-center text-white font-bold">
                  2021
                </div>
                <div>
                  <h4 className="font-bold text-lg">4기-5기 활동</h4>
                  <p className="text-gray-600">연합 데이터톤 참여 시작 및 대외 활동 확대</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-[#0B2447] rounded-full flex items-center justify-center text-white font-bold">
                  2024
                </div>
                <div>
                  <h4 className="font-bold text-lg">6기 현재</h4>
                  <p className="text-gray-600">DArt-B의 밤 네트워킹 이벤트 신설 및 웹사이트 구축</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}