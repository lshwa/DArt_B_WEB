import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function Preface() {
  return (
    <div className="min-h-screen">
      <PageBanner title="PREFACE" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Professor Introduction */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0B2447] mb-6">
              안녕하세요, DArt-B 지도교수<br />
              중앙대학교 경영학과 서용원 교수입니다.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 items-start">
            {/* Left Side - Message */}
            <div className="md:col-span-2">
              <div className="prose prose-lg text-gray-700 leading-relaxed space-y-6">
                <p>
                  데이터 분석은 이제 모든 분야에서 필수적인 역량이 되었습니다. 
                  특히 비즈니스 환경에서는 데이터를 통해 인사이트를 발견하고, 
                  이를 바탕으로 전략적 의사결정을 내리는 능력이 무엇보다 중요합니다.
                </p>
                
                <p>
                  DArt-B는 단순히 데이터 분석 기법을 배우는 것을 넘어서, 
                  비즈니스 맥락에서 데이터를 이해하고 활용할 수 있는 실무진을 양성하는 것을 목표로 합니다. 
                  이론과 실습을 균형있게 배우며, 실제 프로젝트를 통해 경험을 쌓아가는 과정에서 
                  여러분들이 데이터 분석 전문가로 성장할 수 있을 것입니다.
                </p>
                
                <p>
                  학회 활동을 통해 동료들과 함께 배우고 성장하며, 
                  데이터 분석에 대한 열정을 키워나가시기 바랍니다. 
                  앞으로의 여정에서 큰 성과를 거두시길 응원합니다.
                </p>
              </div>
              
              {/* Signature */}
              <div className="mt-8 text-right">
                <div className="inline-block">
                  <p className="text-lg font-bold text-[#0B2447] mb-2">서용원</p>
                  <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
                    친필 싸인
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Professor Photo */}
            <div>
              <div className="bg-gray-200 rounded-[10px] h-80 flex items-center justify-center text-gray-500">
                교수님 증명사진
              </div>
            </div>
          </div>

          {/* Career History */}
          <div className="mt-16 bg-gray-50 rounded-[10px] p-8">
            <h3 className="text-2xl font-bold text-[#0B2447] text-center mb-8">약력</h3>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <span className="font-bold text-[#0B2447] min-w-16">2020</span>
                  <span className="font-medium min-w-32">중앙대학교</span>
                  <span className="text-gray-700">경영학부 교수 부임</span>
                </div>
                
                <div className="flex items-start space-x-4">
                  <span className="font-bold text-[#0B2447] min-w-16">2019</span>
                  <span className="font-medium min-w-32">DArt-B</span>
                  <span className="text-gray-700">데이터 분석 학회 지도교수 역임</span>
                </div>
                
                <div className="flex items-start space-x-4">
                  <span className="font-bold text-[#0B2447] min-w-16">2018</span>
                  <span className="font-medium min-w-32">연구업적</span>
                  <span className="text-gray-700">데이터 사이언스 관련 주요 논문 다수 발표</span>
                </div>
                
                <div className="flex items-start space-x-4">
                  <span className="font-bold text-[#0B2447] min-w-16">2015</span>
                  <span className="font-medium min-w-32">학계 경력</span>
                  <span className="text-gray-700">박사학위 취득 및 연구 활동 시작</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}