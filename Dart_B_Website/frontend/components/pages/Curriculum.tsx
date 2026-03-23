import React from 'react';
import { PageBanner } from '../common/PageBanner';
import { DynamicImage } from '../common/DynamicImage';
import { BookOpen, Users, Presentation, RefreshCw } from 'lucide-react';
import { useDynamicList, DynamicItem } from '../../src/useDynamicList';

interface CurriculumItem extends DynamicItem {
  title: string;
  description: string;
  imageKey: string;
}

const DEFAULT_CURRICULUM: CurriculumItem[] = [
  {
    id: '1',
    title: '토이프로젝트',
    description: '학기 중 진행되는 토이프로젝트를 통해 실제 데이터를 활용한 분석 경험을 쌓습니다. 팀 단위로 진행되며, 기획부터 분석, 발표까지 전 과정을 경험할 수 있습니다.',
    imageKey: 'curriculum.assignment',
  },
  {
    id: '2',
    title: '학술제',
    description: '매 학기 말에 진행되는 학술제에서는 한 학기 동안의 학습 성과를 발표합니다. 개인 또는 팀 프로젝트를 통해 실무 역량을 기르고, 발표 경험을 쌓을 수 있습니다.',
    imageKey: 'curriculum.study',
  },
  {
    id: '3',
    title: '지도교수님/연사 특강',
    description: '지도교수님과 외부 전문가를 모신 특강을 통해 최신 트렌드와 실무 노하우를 학습합니다. 이론과 실무를 연결하는 소중한 기회입니다.',
    imageKey: 'home.curriculum.session',
  },
];

export function Curriculum() {
  const { items: curriculumItems, isLoading } = useDynamicList<CurriculumItem>(
    'curriculum.items',
    DEFAULT_CURRICULUM,
  );

  return (
    <div className="min-h-screen">
      <PageBanner title="CURRICULUM" />
      
      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Introduction */}
          <div className="text-center mb-16">
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              DArt-B는 토이 프로젝트와 학술제를 통해 실전 프로젝트 경험을 쌓고, 체계적으로 짜여진 정규 과제와 스터디 활동을 통해 
              양질의 학습을 돕습니다. 또한 학기마다 진행되는 지도교수님/연사님의 특강 등 다양한 활동 속에서 학회원들은 
              실력과 시야를 동시에 확장할 수 있도록 노력합니다.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0B2447] mb-2">세션활동</h3>
              <p className="text-gray-600">정규 세션을 통한 체계적 학습</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0B2447] mb-2">정규 과제</h3>
              <p className="text-gray-600">실습을 통한 역량 강화</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#0B2447] rounded-full flex items-center justify-center mx-auto mb-4">
                <Presentation className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0B2447] mb-2">스터디</h3>
              <p className="text-gray-600">소그룹 심화 학습</p>
            </div>
          </div>

          {/* Regular Session overview */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-[#0B2447] text-center mb-12">정규 세션 활동</h2>
            <div className="text-center mb-12">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {['세션 활동 사진 1', '세션 활동 사진 2', '세션 활동 사진 3'].map((label) => (
                  <div key={label} className="bg-gray-100 rounded-[10px] h-40 flex items-center justify-center">
                    <span className="text-gray-500">{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">
                매주 화요일 오후 7시에 진행되는 정규 세션에서는 데이터 분석의 기초부터 심화까지 체계적으로 학습합니다.
              </p>
            </div>
          </div>

          {/* Dynamic Curriculum Items */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-[#0B2447]" />
            </div>
          ) : (
            <div className="space-y-12 mb-20">
              {curriculumItems.map((item, index) => (
                <div
                  key={item.id}
                  className="grid md:grid-cols-2 gap-12 items-center"
                >
                  <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                    <DynamicImage
                      imageKey={item.imageKey}
                      alt={item.title}
                      className="w-full h-64 object-cover rounded-[10px] shadow-lg"
                    />
                  </div>
                  <div className={index % 2 === 1 ? 'md:order-1 text-left' : 'text-left'}>
                    <h3 className="text-2xl font-bold text-[#0B2447] mb-4">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Static regular assignments & study sections */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-[#0B2447] text-center mb-12">정규 과제</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <DynamicImage imageKey="curriculum.assignment" alt="정규 과제" className="w-full h-64 object-cover rounded-[10px] shadow-lg" />
              <div className="text-left">
                <h3 className="text-2xl font-bold text-[#0B2447] mb-4">주간 정규 과제</h3>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>매주 주어지는 정규 과제를 통해 세션에서 배운 내용을 복습하고 심화 학습할 수 있습니다.</p>
                  <p>실제 데이터를 활용한 분석 과제부터 이론 정리까지 다양한 형태의 과제가 제공됩니다.</p>
                  <p>개인별 맞춤 피드백을 통해 꾸준한 성장을 도모하며, 실력 향상을 체계적으로 지원합니다.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#0B2447] text-center mb-12">스터디</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="md:order-2 text-left">
                <h3 className="text-2xl font-bold text-[#0B2447] mb-4">소그룹 스터디</h3>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>관심 분야별로 구성된 소그룹 스터디를 통해 더 깊이 있는 학습을 진행합니다.</p>
                  <p>머신러닝, 딥러닝, 비즈니스 애널리틱스, 통계학 등 다양한 주제의 스터디가 운영됩니다.</p>
                  <p>동료들과 함께 학습하며 지식을 공유하고, 서로의 성장을 돕는 협력적 학습 환경을 제공합니다.</p>
                </div>
              </div>
              <div className="md:order-1">
                <DynamicImage imageKey="curriculum.study" alt="스터디 그룹" className="w-full h-64 object-cover rounded-[10px] shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}