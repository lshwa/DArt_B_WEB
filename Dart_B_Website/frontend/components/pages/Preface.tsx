import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useSiteTextContext } from '../../src/SiteTextContext';
import prof_pict from '../../assets/images/교수님사진.png';

export function Preface() {
  const { getText } = useSiteTextContext();

  const headingLines = getText('preface.heading').split('\n');

  return (
    <div className="min-h-screen">
      <PageBanner title="PREFACE" />

      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 items-start">
            {/* Left Side - Heading + Message */}
            <div className="md:col-span-2">
              {/* Professor Introduction */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0B2447] mb-6 leading-snug">
                  {headingLines.map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < headingLines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h2>
              </div>

              <div className="prose prose-lg text-gray-700 leading-relaxed space-y-6 max-w-none">
                <p>{getText('preface.body1')}</p>
                <p>{getText('preface.body2')}</p>
                <p>{getText('preface.body3')}</p>
                <p>{getText('preface.body4')}</p>
              </div>

              {/* Sign-off */}
              <div className="mt-10 flex items-center justify-end gap-4">
                <span className="text-sm text-gray-600">중앙대학교 DArt-B 데이터분석학회 지도교수</span>
                <p
                  style={{ fontFamily: "'Nanum Brush Script', cursive" }}
                  className="text-4xl text-[#0B2447] leading-none"
                >
                  서용원
                </p>
              </div>
            </div>

            {/* Right Side - Professor Card */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-3">
                {/* Photo */}
                <div className="overflow-hidden rounded-sm w-44">
                  <img
                    src={prof_pict}
                    alt="교수님 증명사진"
                    className="w-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="text-center space-y-0.5">
                  <p className="text-sm text-gray-500">DArt-B 지도교수</p>
                  <p className="text-lg font-bold text-[#0B2447] tracking-widest">서 용 원</p>
                  <p className="text-sm text-gray-600">(중앙대학교 교수)</p>
                  <p className="text-sm text-gray-600">한국경영과학회 수석부회장</p>
                </div>
              </div>
            </div>
          </div>

          {/* Career History */}
          <div className="mt-16 bg-gray-50 rounded-[10px] p-8">
            <h3 className="text-2xl font-bold text-[#0B2447] text-center mb-8">
              약력
            </h3>
            <div className="max-w-4xl mx-auto">
              <div
                className="grid gap-y-4 gap-x-8"
                style={{ gridTemplateColumns: '4.5rem 18rem 1fr' }}
              >
                <span className="font-bold text-[#0B2447]">현재</span>
                <span className="font-medium">연구업적</span>
                <span className="text-gray-700">국내외 학술지(SCI, SSCI, KCI 등) 110편 이상 논문 게재</span>

                <span className="font-bold text-[#0B2447]">2027</span>
                <span className="font-medium">한국경영과학회(KORMS)</span>
                <span className="text-gray-700">회장 (예정)</span>

                <span className="font-bold text-[#0B2447]">2021</span>
                <span className="font-medium">한국생산운영관리학회(KOPOMS)</span>
                <span className="text-gray-700">회장 역임</span>

                <span className="font-bold text-[#0B2447]">2019</span>
                <span className="font-medium">DArt-B</span>
                <span className="text-gray-700">데이터 분석 학회 지도교수 부임</span>

                <span className="font-bold text-[#0B2447]">2009</span>
                <span className="font-medium">중앙대학교</span>
                <span className="text-gray-700">경영학부 교수 부임</span>

                <span className="font-bold text-[#0B2447]">2001</span>
                <span className="font-medium">한국지능정보사회진흥원(NIA)</span>
                <span className="text-gray-700">국가정보화센터 선임연구원</span>

                <span className="font-bold text-[#0B2447]">2001</span>
                <span className="font-medium">서울대학교</span>
                <span className="text-gray-700">공학박사 (산업공학)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}