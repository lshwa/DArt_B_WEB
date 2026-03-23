import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { useSiteTextContext } from '../../src/SiteTextContext';
import { useDynamicList, DynamicItem } from '../../src/useDynamicList';

interface HistoryItem extends DynamicItem {
  year: string;
  title: string;
  description: string;
}

const DEFAULT_HISTORY: HistoryItem[] = [
  { id: '1', year: '2019', title: '1기 창립', description: '중앙대학교 경영학부 데이터 분석 학회 DArt-B 창립' },
  { id: '2', year: '2020', title: '2기-3기 활동', description: '온라인 세션 도입 및 정규 커리큘럼 체계화' },
  { id: '3', year: '2021', title: '4기-5기 활동', description: '연합 데이터톤 참여 시작 및 대외 활동 확대' },
  { id: '4', year: '2024', title: '6기 현재', description: 'DArt-B의 밤 네트워킹 이벤트 신설 및 웹사이트 구축' },
];

export function AboutUs() {
  const { getText } = useSiteTextContext();
  const { items: history } = useDynamicList<HistoryItem>('about.history', DEFAULT_HISTORY);

  return (
    <div className="min-h-screen">
      <PageBanner title="ABOUT US" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Introduction */}
          <div className="text-center mb-16">
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              {getText('about.intro')}
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
                <p>{getText('about.body1')}</p>
                <p>{getText('about.body2')}</p>
                <p>{getText('about.body3')}</p>
              </div>
            </div>
          </div>

          {/* Dynamic History Section */}
          <div className="bg-gray-50 rounded-[10px] p-8">
            <h3 className="text-2xl font-bold text-[#0B2447] text-center mb-8">연혁</h3>
            {history.length === 0 ? (
              <p className="text-center text-gray-400 py-4">등록된 연혁이 없습니다.</p>
            ) : (
              <div className="space-y-6">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-[#0B2447] rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm text-center px-1">
                      {item.year}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}