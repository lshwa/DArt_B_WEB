import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useSiteTextContext } from '../../src/SiteTextContext';
import prof_pict from '../../assets/images/교수님증명사진.png';

export function Preface() {
  const { getText } = useSiteTextContext();

  // The heading may contain a literal \n in the stored value
  const headingLines = getText('preface.heading').split('\n');

  return (
    <div className="min-h-screen">
      <PageBanner title="PREFACE" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Professor Introduction */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0B2447] mb-6">
              {headingLines.map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < headingLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 items-start">
            {/* Left Side - Message */}
            <div className="md:col-span-2">
              <div className="prose prose-lg text-gray-700 leading-relaxed space-y-6">
                <p>{getText('preface.body1')}</p>
                <p>{getText('preface.body2')}</p>
                <p>{getText('preface.body3')}</p>
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
              <div className="bg-gray-200 rounded-[10px] h-[400px] overflow-hidden">
                <img
                  src={prof_pict}
                  alt="교수님 증명사진"
                  className="w-full h-full object-cover object-top"
                />  
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